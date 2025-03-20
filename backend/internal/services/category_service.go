package services

import (
	"context"
	"fmt"

	"github.com/ktruedat/healthisis/backend/internal/database"
	"github.com/ktruedat/healthisis/backend/internal/models"
)

// CategoryService handles category-related business logic
type CategoryService struct {
	db *database.DB
}

// NewCategoryService creates a new CategoryService
func NewCategoryService(db *database.DB) *CategoryService {
	return &CategoryService{db: db}
}

// GetCategories retrieves all disease categories
func (s *CategoryService) GetCategories(ctx context.Context) ([]models.Category, error) {
	// Implement category retrieval logic here
	return []models.Category{
		{ID: 1, Name: "Respiratory Infections"},
		{ID: 2, Name: "Viral Hepatitis"},
		{ID: 3, Name: "STIs"},
		{ID: 4, Name: "COVID-19"},
		{ID: 5, Name: "Intestinal Infections"},
	}, nil
}

// CreateCategory creates a new disease category
func (s *CategoryService) CreateCategory(ctx context.Context, category *models.Category) error {
	// Implement category creation logic here
	return nil
}

// UpdateCategory updates an existing disease category
func (s *CategoryService) UpdateCategory(ctx context.Context, category *models.Category) error {
	// Implement category update logic here
	return nil
}

// DeleteCategory removes a disease category
func (s *CategoryService) DeleteCategory(ctx context.Context, id int) error {
	// Implement category deletion logic here
	return nil
}

// GetDiseasesByCategory gets all diseases in a specific category
func (s *CategoryService) GetDiseasesByCategory(ctx context.Context, categoryID int) ([]models.Disease, error) {
	// Implement logic to get diseases by category
	query := `
		SELECT 
			id, name, category, year, quarter, region, cases, deaths, 
			recoveries, population, incidence_rate, prevalence_rate, mortality_rate
		FROM diseases
		WHERE category = ?
	`

	var categoryName string
	switch categoryID {
	case 1:
		categoryName = "Respiratory Infections"
	case 2:
		categoryName = "Viral Hepatitis"
	case 3:
		categoryName = "STIs"
	case 4:
		categoryName = "COVID-19"
	case 5:
		categoryName = "Intestinal Infections"
	default:
		return nil, fmt.Errorf("invalid category ID")
	}

	rows, err := s.db.GetConn().Query(ctx, query, categoryName)
	if err != nil {
		return nil, fmt.Errorf("error querying diseases by category: %w", err)
	}
	defer rows.Close()

	var diseases []models.Disease
	for rows.Next() {
		var d models.Disease
		if err := rows.Scan(
			&d.ID, &d.Name, &d.Category, &d.Year, &d.Quarter, &d.Region,
			&d.Cases, &d.Deaths, &d.Recoveries, &d.Population,
			&d.IncidenceRate, &d.PrevalenceRate, &d.MortalityRate,
		); err != nil {
			return nil, fmt.Errorf("error scanning disease row: %w", err)
		}
		diseases = append(diseases, d)
	}

	return diseases, nil
}
