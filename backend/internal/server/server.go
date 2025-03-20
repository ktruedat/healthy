package server

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/ktruedat/healthisis/backend/internal/config"
	"github.com/ktruedat/healthisis/backend/internal/database"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers"
)

// Server represents HTTP server
type Server struct {
	config     *config.Config
	router     *chi.Mux
	httpServer *http.Server
	handlers   *handlers.Handlers
}

// New creates a new server instance
func New(cfg *config.Config, db *database.DB) *Server {
	// Set up router
	r := chi.NewRouter()

	// Set up all handlers
	h := handlers.New(db)

	// Create server
	s := &Server{
		config:   cfg,
		router:   r,
		handlers: h,
	}

	// Configure HTTP server
	s.httpServer = &http.Server{
		Addr:         ":" + strconv.Itoa(cfg.Server.Port),
		Handler:      s.router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	// Set up middleware and routes
	s.setupMiddleware()
	s.setupRoutes()

	return s
}

// setupMiddleware configures middleware for the router
func (s *Server) setupMiddleware() {
	// Add StripSlashes middleware to handle both /categories and /categories/
	s.router.Use(middleware.StripSlashes)

	s.router.Use(middleware.RequestID)
	s.router.Use(middleware.RealIP)
	s.router.Use(middleware.Logger)
	s.router.Use(middleware.Recoverer)
	s.router.Use(middleware.Timeout(time.Duration(s.config.Server.Timeout) * time.Second))

	// CORS middleware
	s.router.Use(
		cors.Handler(
			cors.Options{
				AllowedOrigins:   s.config.CORS.AllowedOrigins,
				AllowedMethods:   s.config.CORS.AllowedMethods,
				AllowedHeaders:   s.config.CORS.AllowedHeaders,
				ExposedHeaders:   s.config.CORS.ExposedHeaders,
				AllowCredentials: s.config.CORS.AllowCredentials,
				MaxAge:           s.config.CORS.MaxAge,
			},
		),
	)
}

// setupRoutes configures routes for the router
func (s *Server) setupRoutes() {
	// API v1 routes
	s.router.Route("/api/v1", func(r chi.Router) {
		// Serve Swagger UI documentation at /api/v1/swagger
		handlers.ServeSwaggerUI(r)

		// Diseases
		r.Route("/diseases", func(r chi.Router) {
			r.Get("/", s.handlers.Disease.List)
			r.Post("/", s.handlers.Disease.Create)
			r.Route("/{diseaseID}", func(r chi.Router) {
				r.Get("/", s.handlers.Disease.Get)
				r.Patch("/", s.handlers.Disease.Update)
				r.Delete("/", s.handlers.Disease.Delete)
				r.Post("/data", s.handlers.Disease.AddData)
				// Remove the compare endpoint
				r.Get("/predict", s.handlers.Disease.Predict)
			})
		})

		// Categories
		r.Route("/categories", func(r chi.Router) {
			r.Get("/", s.handlers.Category.List)
			r.Post("/", s.handlers.Category.Create)
			r.Route("/{categoryID}", func(r chi.Router) {
				r.Patch("/", s.handlers.Category.Update)
				r.Delete("/", s.handlers.Category.Delete)
				r.Get("/diseases", s.handlers.Category.GetDiseases)
			})
		})

		// Dashboard
		r.Route("/dashboard", func(r chi.Router) {
			r.Get("/summary", s.handlers.Dashboard.Summary)
			r.Get("/trends", s.handlers.Dashboard.Trends)
			r.Get("/map", s.handlers.Dashboard.Map)
		})

		// Analytics
		r.Route("/analytics", func(r chi.Router) {
			r.Post("/correlation", s.handlers.Analytics.Correlation)
			r.Post("/forecast", s.handlers.Analytics.Forecast)
			r.Post("/query", s.handlers.Analytics.Query)
		})

		// Alerts
		// r.Route("/alerts", func(r chi.Router) {
		// 	r.Get("/", s.handlers.Alert.List)
		// 	r.Post("/", s.handlers.Alert.Create)
		// })

		// AI Query endpoint
		r.Post("/query", s.handlers.AI.Query)
	})

	// Health check endpoint
	s.router.Get("/health", s.handlers.System.HealthCheck)
}

// Run starts the HTTP server
func (s *Server) Run() error {
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the HTTP server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
