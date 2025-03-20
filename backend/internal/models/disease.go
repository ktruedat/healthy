package models

// Disease represents disease data with time series information
type Disease struct {
	ID              string         `json:"id" ch:"id"`
	Name            string         `json:"name" ch:"name"`
	Category        string         `json:"category" ch:"category"`
	Year            uint16         `json:"year" ch:"year"`       // Changed from int to uint16 for ClickHouse compatibility
	Quarter         uint8          `json:"quarter" ch:"quarter"` // Changed from int to uint8
	Region          string         `json:"region" ch:"region"`
	Cases           uint32         `json:"cases" ch:"cases"`           // Changed from int to uint32
	Deaths          uint32         `json:"deaths" ch:"deaths"`         // Changed from int to uint32
	Recoveries      uint32         `json:"recoveries" ch:"recoveries"` // Changed from int to uint32
	Population      uint32         `json:"population" ch:"population"` // Changed from int to uint32
	IncidenceRate   float64        `json:"incidenceRate" ch:"incidence_rate"`
	PrevalenceRate  float64        `json:"prevalenceRate" ch:"prevalence_rate"` // Added prevalence rate
	MortalityRate   float64        `json:"mortalityRate" ch:"mortality_rate"`
	EnvironmentData map[string]any `json:"environmentData,omitempty" ch:"-"`
}

// DiseaseFilter contains filter parameters for disease data queries
type DiseaseFilter struct {
	StartYear  *int     `json:"startYear" form:"startYear"`
	EndYear    *int     `json:"endYear" form:"endYear"`
	Quarters   []int    `json:"quarters" form:"quarters"`
	Regions    []string `json:"regions" form:"regions"`
	Categories []string `json:"categories" form:"categories"`
	DiseaseIDs []string `json:"diseaseIds" form:"diseaseIds"`
	MinCases   *int     `json:"minCases" form:"minCases"`
	MaxCases   *int     `json:"maxCases" form:"maxCases"`
	SortBy     string   `json:"sortBy" form:"sortBy"`
	SortOrder  string   `json:"sortOrder" form:"sortOrder"`
	Limit      int      `json:"limit" form:"limit"`
	Offset     int      `json:"offset" form:"offset"`
}

// DiseaseStats represents aggregated disease statistics
type DiseaseStats struct {
	TotalCases      int     `json:"totalCases"`
	TotalDeaths     int     `json:"totalDeaths"`
	TotalRecoveries int     `json:"totalRecoveries"`
	AverageRate     float64 `json:"averageRate"`
	TrendDirection  string  `json:"trendDirection"`
	ChangePercent   float64 `json:"changePercent"`
}

// DiseaseTimePoint represents a single data point in a time series
type DiseaseTimePoint struct {
	Year    int    `json:"year"`
	Quarter int    `json:"quarter"`
	Name    string `json:"name"`
	// Change uint32 to uint64 to match ClickHouse UInt64 type
	Cases uint64 `json:"cases"`
}

// TimeSeries represents a collection of disease data points over time
type TimeSeries struct {
	Points []DiseaseTimePoint `json:"points"`
}

// DiseaseQuery represents a natural language query for the AI system
type DiseaseQuery struct {
	Query string `json:"query"`
}
