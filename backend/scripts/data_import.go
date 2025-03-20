package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// Disease represents a disease record to insert into ClickHouse
type Disease struct {
	ID              string
	Name            string
	Category        string
	Year            uint16
	Quarter         uint8
	Region          string
	Cases           uint32
	Deaths          uint32
	Recoveries      uint32
	Population      uint32
	IncidenceRate   float64
	PrevalenceRate  float64 // Added prevalence rate
	MortalityRate   float64
	EnvironmentData map[string]interface{}
}

var (
	dataDir  = flag.String("data", "./data", "Directory containing CSV data files")
	host     = flag.String("host", "localhost", "ClickHouse host")
	port     = flag.String("port", "9000", "ClickHouse port")
	database = flag.String("db", "healthisis", "ClickHouse database")
	username = flag.String("user", "default", "ClickHouse username")
	password = flag.String("password", "", "ClickHouse password")
)

func main() {
	flag.Parse()

	log.Println("Starting data import process...")
	log.Printf("Using data directory: %s", *dataDir)

	// Connect to ClickHouse
	conn, err := connectToClickHouse()
	if err != nil {
		log.Fatalf("Failed to connect to ClickHouse: %v", err)
	}
	defer conn.Close()

	// Create database if it doesn't exist
	err = createDatabase(conn)
	if err != nil {
		log.Fatalf("Failed to create database: %v", err)
	}

	// Create table if it doesn't exist
	err = createTable(conn)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

	// Process infectious disease data
	log.Println("Processing infectious disease data...")
	diseases, err := processInfectiousDiseases()
	if err != nil {
		log.Fatalf("Failed to process infectious diseases data: %v", err)
	}
	log.Printf("Processed %d disease records from the CSV", len(diseases))

	if len(diseases) == 0 {
		log.Println("WARNING: No disease records were found in the CSV files")
		log.Println("Please check the file paths and CSV format")
		return
	}

	// Add prevalence/incidence data
	err = addCategoryData(diseases)
	if err != nil {
		log.Fatalf("Failed to add category data: %v", err)
	}

	// Add environmental data
	err = addEnvironmentalData(diseases)
	if err != nil {
		log.Fatalf("Failed to add environmental data: %v", err)
	}

	// Import data into ClickHouse
	err = importDataToClickHouse(conn, diseases)
	if err != nil {
		log.Fatalf("Failed to import data to ClickHouse: %v", err)
	}

	log.Printf("Successfully imported %d disease records to ClickHouse", len(diseases))
}

// connectToClickHouse establishes a connection to the ClickHouse server
func connectToClickHouse() (driver.Conn, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%s", *host, *port)},
		Auth: clickhouse.Auth{
			Database: *database,
			Username: *username,
			Password: *password,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:     time.Second * 10,
		ConnMaxLifetime: time.Hour,
	})
	if err != nil {
		return nil, err
	}

	// Verify connection
	if err := conn.Ping(context.Background()); err != nil {
		return nil, err
	}

	return conn, nil
}

// createDatabase creates the database if it doesn't exist
func createDatabase(conn driver.Conn) error {
	return conn.Exec(context.Background(), fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", *database))
}

// createTable creates the diseases table if it doesn't exist
func createTable(conn driver.Conn) error {
	query := `
	CREATE TABLE IF NOT EXISTS diseases (
		id String,
		name String,
		category String,
		year UInt16,
		quarter UInt8,
		region String,
		cases UInt32,
		deaths UInt32,
		recoveries UInt32,
		population UInt32,
		incidence_rate Float64,
		prevalence_rate Float64,  
		mortality_rate Float64,
		environment_data String
	) ENGINE = MergeTree()
	ORDER BY (year, quarter, category, name, region)
	`
	return conn.Exec(context.Background(), query)
}

// processInfectiousDiseases reads and processes infectious diseases data from CSV files
func processInfectiousDiseases() (map[string]*Disease, error) {
	diseases := make(map[string]*Disease)

	// Process main infectious diseases data
	infectiousFilePath := filepath.Join(*dataDir, "infectious_diseases_yearly_quarterly.csv")
	log.Printf("Reading infectious disease data from: %s", infectiousFilePath)

	file, err := os.Open(infectiousFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open infectious diseases file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1 // Allow variable number of fields
	reader.Comma = ','          // Use comma as the default separator
	reader.TrimLeadingSpace = true

	// Read header
	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}
	log.Printf("Found %d columns in header", len(header))

	// Parse years and quarters from header
	yearQuarters := make([]struct {
		year    int
		quarter int
	}, 0, len(header)-1)

	for i := 1; i < len(header); i++ {
		parts := strings.Split(header[i], " ")
		log.Printf("Parsing header column %d: %s", i, header[i])

		if len(parts) >= 2 {
			year, err := strconv.Atoi(parts[0])
			if err != nil {
				log.Printf("Warning: Could not parse year from %s: %v", header[i], err)
				continue
			}

			quarterStr := parts[1]
			if len(quarterStr) == 0 {
				log.Printf("Warning: Quarter string is empty in %s", header[i])
				continue
			}

			var quarter int
			// Handle both numeric and Roman numeral formats
			if strings.HasPrefix(quarterStr, "Q") && len(quarterStr) > 1 {
				quarter, err = strconv.Atoi(quarterStr[1:2])
			} else if quarterStr == "I" {
				quarter = 1
			} else if quarterStr == "II" {
				quarter = 2
			} else if quarterStr == "III" {
				quarter = 3
			} else if quarterStr == "IV" {
				quarter = 4
			} else if len(quarterStr) >= 1 {
				quarter, err = strconv.Atoi(quarterStr[0:1]) // Extract first digit as quarter
			}

			if err != nil || quarter < 1 || quarter > 4 {
				log.Printf("Warning: Could not parse quarter from %s: %v", quarterStr, err)
				continue
			}

			yearQuarters = append(yearQuarters, struct {
				year    int
				quarter int
			}{year: year, quarter: quarter})

			log.Printf("Added year: %d, quarter: %d", year, quarter)
		} else {
			log.Printf("Warning: Column header format not recognized: %s", header[i])
		}
	}

	log.Printf("Successfully parsed %d year-quarter combinations", len(yearQuarters))

	// Get population data (we'll use a simplified approach for demo)
	populationByYear := map[int]int{
		2014: 3556400,
		2015: 3553056,
		2016: 3550852,
		2017: 3547539,
		2018: 3542708,
		2019: 3535112,
		2020: 3515894,
		2021: 3232724,
		2022: 3095176,
		2023: 3059639,
		2024: 3028803,
	}

	// Read disease data rows
	lineCount := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error reading CSV record: %w", err)
		}

		lineCount++
		if lineCount == 1 {
			continue // Skip header if it was already read
		}

		diseaseName := strings.TrimSpace(record[0])
		if diseaseName == "" {
			log.Printf("Skipping record with empty disease name at line %d", lineCount)
			continue
		}

		log.Printf("Processing disease: %s (line %d)", diseaseName, lineCount)

		// Create disease entry for each year/quarter
		recordsAdded := 0
		for i, yq := range yearQuarters {
			if i+1 >= len(record) {
				log.Printf("Warning: Not enough columns for %s at index %d", diseaseName, i)
				continue
			}

			caseValue := strings.TrimSpace(record[i+1])
			// Skip empty or invalid data
			if caseValue == "" || caseValue == ".." || caseValue == "C" || caseValue == "-" {
				log.Printf("Skipping empty/invalid value for %s in %d Q%d: %s",
					diseaseName, yq.year, yq.quarter, caseValue)
				continue
			}

			// Parse case count
			cases, err := strconv.Atoi(caseValue)
			if err != nil {
				log.Printf("Warning: Invalid case count '%s' for disease '%s' in %d Q%d, skipping",
					caseValue, diseaseName, yq.year, yq.quarter)
				continue
			}

			// Create unique ID for the disease record
			id := fmt.Sprintf("%s_%d_%d", strings.Replace(diseaseName, " ", "_", -1), yq.year, yq.quarter)

			// Calculate population for this year
			population := populationByYear[yq.year]
			if population == 0 {
				population = 3500000 // Default if not found
			}

			// Calculate incidence rate per 100,000 people
			incidenceRate := float64(cases) * 100000 / float64(population)

			// Estimate mortality rate based on disease type and severity
			mortalityRate := calculateMortalityRate(diseaseName, yq.year)

			// Estimate deaths based on mortality rate
			deaths := int(float64(cases) * mortalityRate / 100)

			// Estimate recoveries (simple approach: cases - deaths)
			recoveries := cases - deaths
			if recoveries < 0 {
				recoveries = 0
			}

			// Determine disease category
			category := categorizeDisease(diseaseName)

			disease := &Disease{
				ID:              id,
				Name:            diseaseName,
				Category:        category,
				Year:            uint16(yq.year),
				Quarter:         uint8(yq.quarter),
				Region:          "Republic of Moldova",
				Cases:           uint32(cases),
				Deaths:          uint32(deaths),
				Recoveries:      uint32(recoveries),
				Population:      uint32(population),
				IncidenceRate:   incidenceRate,
				MortalityRate:   mortalityRate,
				EnvironmentData: make(map[string]interface{}),
			}

			diseases[id] = disease
			recordsAdded++
		}

		log.Printf("Added %d records for disease: %s", recordsAdded, diseaseName)
	}

	log.Printf("Found %d disease records in total", len(diseases))
	return diseases, nil
}

// calculateMortalityRate estimates a mortality rate for the disease
// This is a simplified approach - in reality you would use actual mortality data
func calculateMortalityRate(diseaseName string, year int) float64 {
	// These are rough estimates for demonstration purposes
	switch {
	case strings.Contains(diseaseName, "COVID-19"):
		// COVID mortality rate varied by year
		switch {
		case year == 2020:
			return 3.5
		case year == 2021:
			return 2.8
		default:
			return 1.5
		}
	case strings.Contains(diseaseName, "Tuberculoza"):
		return 4.5
	case strings.Contains(diseaseName, "Hepatita virala"):
		return 0.5
	case strings.Contains(diseaseName, "Gripa"):
		return 0.1
	case strings.Contains(diseaseName, "Pneumonii"):
		return 2.0
	case strings.Contains(diseaseName, "Infectie cu HIV") || strings.Contains(diseaseName, "SIDA"):
		return 5.0
	default:
		// Default low mortality rate for most infectious diseases
		return 0.05
	}
}

// categorizeDisease assigns a category based on the disease name
func categorizeDisease(diseaseName string) string {
	switch {
	case strings.Contains(diseaseName, "Hepatit"):
		return "Viral Hepatitis"
	case strings.Contains(diseaseName, "Tuberculoz"):
		return "Respiratory Infections"
	case strings.Contains(diseaseName, "Gripa") || strings.Contains(diseaseName, "respirator"):
		return "Respiratory Infections"
	case strings.Contains(diseaseName, "Pneumon"):
		return "Respiratory Infections"
	case strings.Contains(diseaseName, "HIV") || strings.Contains(diseaseName, "SIDA"):
		return "STIs"
	case strings.Contains(diseaseName, "Sifilis") || strings.Contains(diseaseName, "gonococic"):
		return "STIs"
	case strings.Contains(diseaseName, "intestinal") || strings.Contains(diseaseName, "Salmonel") ||
		strings.Contains(diseaseName, "Dizenter") || strings.Contains(diseaseName, "Escherichioze"):
		return "Intestinal Infections"
	case strings.Contains(diseaseName, "Coronavirus"):
		return "COVID-19"
	default:
		return "Other Infectious Diseases"
	}
}

// addCategoryData reads prevalence data by disease category and adds it to our disease records
func addCategoryData(diseases map[string]*Disease) error {
	categoriesFilePath := filepath.Join(*dataDir, "categories_prevalence_incidence.csv")
	log.Printf("Reading category data from: %s", categoriesFilePath)
	
	file, err := os.Open(categoriesFilePath)
	if err != nil {
		return fmt.Errorf("failed to open categories file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1

	// Skip header
	header, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read header: %w", err)
	}
	
	log.Printf("Found %d columns in categories file header", len(header))

	// Create category to our category mapping
	categoryMapping := map[string]string{
		"Boli infectioase si parazitare": "Infectious Diseases",
		"Tumori":                         "Tumors",
		"Boli endocrine, de nutritie si metabolism": "Metabolic Disorders",
		"Boli ale aparatului respirator":            "Respiratory Infections",
		"Boli ale aparatului circulator":            "Circulatory System Diseases",
		"Boli ale aparatului digestiv":              "Digestive System Diseases",
	}
	
	// Store category data for prevalence and incidence by year
	categoryData := make(map[string]map[int]struct{
		prevalence float64
		incidence  float64
	})

	// Read category data
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("error reading CSV record: %w", err)
		}

		categoryName := strings.TrimSpace(record[0])
		if categoryName == "Total" {
			continue
		}
		
		log.Printf("Processing category: %s", categoryName)

		// Map to our category system
		mappedCategory, exists := categoryMapping[categoryName]
		if !exists {
			mappedCategory = "Other"
		}
		
		// Initialize category data map
		if _, exists := categoryData[mappedCategory]; !exists {
			categoryData[mappedCategory] = make(map[int]struct{
				prevalence float64
				incidence  float64
			})
		}

		// Extract both prevalence and incidence data for each year
		for year := 2014; year <= 2023; year++ {
			yearIndex := year - 2014
			
			// Columns 1-10 have prevalence data, columns 11-20 have incidence data
			prevalenceValue := 0.0
			incidenceValue := 0.0
			
			// Extract prevalence (total cases)
			if yearIndex < len(record)-11 {  // Make sure we don't go out of bounds
				prevalenceStr := record[yearIndex+1]  // +1 to skip category name column
				if prevalenceStr != "" {
					if val, err := strconv.ParseFloat(prevalenceStr, 64); err == nil {
						prevalenceValue = val
					}
				}
			}
			
			// Extract incidence (new cases)
			if yearIndex+11 < len(record) {
				incidenceStr := record[yearIndex+11]  // +11 to reach incidence data columns
				if incidenceStr != "" {
					if val, err := strconv.ParseFloat(incidenceStr, 64); err == nil {
						incidenceValue = val
					}
				}
			}
			
			// Store the data
			categoryData[mappedCategory][year] = struct{
				prevalence float64
				incidence  float64
			}{
				prevalence: prevalenceValue,
				incidence:  incidenceValue,
			}
			
			log.Printf("Category %s, Year %d: Prevalence=%.2f, Incidence=%.2f", 
				mappedCategory, year, prevalenceValue, incidenceValue)
		}
	}

	// Apply the data to disease records
	count := 0
	for _, disease := range diseases {
		year := int(disease.Year)
		category := disease.Category
		
		// Skip if year or category not found
		if yearData, exists := categoryData[category]; exists {
			if data, yearExists := yearData[year]; yearExists {
				// Calculate prevalence rate - convert from absolute values (thousands) to rate per 100,000
				if data.prevalence > 0 {
					absolutePrevalence := data.prevalence * 1000  // Convert from thousands to actual count
					disease.PrevalenceRate = absolutePrevalence * 100000 / float64(disease.Population)
					count++
				}
				
				// Only update incidence rate if we don't have a specific value already
				if disease.IncidenceRate == 0 && data.incidence > 0 {
					absoluteIncidence := data.incidence * 1000  // Convert from thousands
					disease.IncidenceRate = absoluteIncidence * 100000 / float64(disease.Population)
				}
			}
		}
	}
	
	log.Printf("Updated prevalence rates for %d disease records", count)
	return nil
}

// addEnvironmentalData adds weather and other environmental factors
func addEnvironmentalData(diseases map[string]*Disease) error {
	// In this simplified version, we'll just add some dummy environmental data
	// since the actual precipitation file might not be available

	log.Println("Adding environmental data to disease records...")

	// Simple environmental factors by year and quarter
	temperatureByYearQuarter := map[int]map[int]float64{
		2014: {1: 0.5, 2: 15.2, 3: 21.4, 4: 5.3},
		2015: {1: -0.2, 2: 16.1, 3: 22.5, 4: 6.1},
		2016: {1: 0.1, 2: 15.8, 3: 23.0, 4: 4.9},
		2017: {1: -1.2, 2: 14.9, 3: 21.8, 4: 7.2},
		2018: {1: 0.8, 2: 17.3, 3: 22.6, 4: 8.4},
		2019: {1: 1.2, 2: 16.5, 3: 23.2, 4: 6.8},
		2020: {1: 2.1, 2: 15.3, 3: 22.8, 4: 5.9},
		2021: {1: -0.5, 2: 14.8, 3: 21.2, 4: 6.7},
		2022: {1: 0.3, 2: 16.8, 3: 24.5, 4: 7.8},
		2023: {1: 1.1, 2: 17.2, 3: 23.9, 4: 8.2},
	}

	humidityByYearQuarter := map[int]map[int]float64{
		2014: {1: 78, 2: 65, 3: 58, 4: 75},
		2015: {1: 80, 2: 63, 3: 55, 4: 77},
		2016: {1: 79, 2: 66, 3: 57, 4: 76},
		2017: {1: 81, 2: 64, 3: 56, 4: 78},
		2018: {1: 77, 2: 60, 3: 53, 4: 73},
		2019: {1: 76, 2: 62, 3: 54, 4: 74},
		2020: {1: 75, 2: 61, 3: 52, 4: 72},
		2021: {1: 82, 2: 67, 3: 59, 4: 79},
		2022: {1: 79, 2: 63, 3: 56, 4: 76},
		2023: {1: 78, 2: 64, 3: 57, 4: 75},
	}

	// Add environmental data to each disease record
	for _, disease := range diseases {
		year := disease.Year
		quarter := disease.Quarter

		// Initialize environment data map if needed
		if disease.EnvironmentData == nil {
			disease.EnvironmentData = make(map[string]interface{})
		}

		// Add temperature data
		if yearData, exists := temperatureByYearQuarter[int(year)]; exists {
			if temp, exists := yearData[int(quarter)]; exists {
				disease.EnvironmentData["avg_temperature_c"] = temp
			}
		}

		// Add humidity data
		if yearData, exists := humidityByYearQuarter[int(year)]; exists {
			if humidity, exists := yearData[int(quarter)]; exists {
				disease.EnvironmentData["avg_humidity_percent"] = humidity
			}
		}

		// Add random precipitation data
		disease.EnvironmentData["precipitation_mm"] = float64(30 + (int(year)%10)*5 + int(quarter)*10)

		// Add some air quality index data (simulated)
		disease.EnvironmentData["air_quality_index"] = float64(50 + (int(year)%5)*10 - int(quarter)*3)
	}

	log.Printf("Added environmental data to %d disease records", len(diseases))
	return nil
}

// importDataToClickHouse imports the disease data into ClickHouse
func importDataToClickHouse(conn driver.Conn, diseases map[string]*Disease) error {
	batch, err := conn.PrepareBatch(context.Background(), `
		INSERT INTO diseases (
			id, name, category, year, quarter, region, 
			cases, deaths, recoveries, population, 
			incidence_rate, prevalence_rate, mortality_rate, environment_data
		)
	`)
	if err != nil {
		return err
	}

	count := 0
	for id, disease := range diseases {
		// Convert environment data to JSON string
		environmentJSON, err := json.Marshal(disease.EnvironmentData)
		if err != nil {
			log.Printf("Warning: Could not marshal environment data for %s: %v", id, err)
			environmentJSON = []byte("{}")
		}

		// Debug log to help diagnose issues
		log.Printf("Adding disease: %s, Year: %d, Quarter: %d", disease.Name, disease.Year, disease.Quarter)

		// Append the data to the batch
		err = batch.Append(
			disease.ID,
			disease.Name,
			disease.Category,
			disease.Year,
			disease.Quarter,
			disease.Region,
			disease.Cases,
			disease.Deaths,
			disease.Recoveries,
			disease.Population,
			disease.IncidenceRate,
			disease.PrevalenceRate, // Added prevalence rate
			disease.MortalityRate,
			string(environmentJSON),
		)
		if err != nil {
			log.Printf("Error appending row for disease %s (%s): %v", disease.Name, disease.ID, err)
			return err
		}
		count++
	}

	log.Printf("Inserting %d disease records into ClickHouse...", count)
	if err := batch.Send(); err != nil {
		return err
	}

	return nil
}
