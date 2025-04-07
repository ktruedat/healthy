package handlers

import (
	"github.com/ktruedat/healthisis/backend/internal/database"
	"github.com/ktruedat/healthisis/backend/internal/pkg/log"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/ai"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/analytics"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/category"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/dashboard"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/disease"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/system"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handlers holds all API handlers
type Handlers struct {
	Disease   *disease.Handler
	Category  *category.Handler
	Analytics *analytics.Handler
	AI        *ai.Handler
	Dashboard *dashboard.Handler
	System    *system.Handler
	logger    log.Logger
}

// New creates all handlers
func New(db *database.DB, logger log.Logger) *Handlers {
	logger.Info("Setting up server handlers...")
	// Initialize services
	diseaseService := services.NewDiseaseService(db)
	categoryService := services.NewCategoryService(db)
	analyticsService := services.NewAnalyticsService(db)
	aiService := services.NewAIService(db)

	// Initialize handlers
	return &Handlers{
		Disease:   disease.New(diseaseService),
		Category:  category.New(categoryService),
		Analytics: analytics.New(analyticsService),
		AI:        ai.New(aiService),
		Dashboard: dashboard.New(diseaseService),
		System:    system.New(),
		logger:    logger,
	}
}
