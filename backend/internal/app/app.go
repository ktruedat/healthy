package app

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ktruedat/healthisis/backend/internal/config"
	"github.com/ktruedat/healthisis/backend/internal/database"
	"github.com/ktruedat/healthisis/backend/internal/server"
)

// App represents the application
type App struct {
	config *config.Config
	server *server.Server
	db     *database.DB
}

// New creates a new application instance
func New(configPath string) (*App, error) {
	// Load configuration
	cfg, err := config.Load(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}

	// Initialize database
	db, err := database.NewClickHouseDB(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Initialize server
	srv := server.New(cfg, db)

	return &App{
		config: cfg,
		server: srv,
		db:     db,
	}, nil
}

// Run starts the application
func (a *App) Run() error {
	// Create a context that will be canceled on interrupt signal
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create a channel to listen for interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("Starting server on port %d in %s mode", a.config.Server.Port, a.config.Server.Env)
		serverErrors <- a.server.Run()
	}()

	// Wait for interrupt signal or server error
	select {
	case err := <-serverErrors:
		return fmt.Errorf("server error: %w", err)
	case sig := <-sigCh:
		log.Printf("Received signal: %v", sig)

		// Create a timeout for graceful shutdown
		shutdownCtx, shutdownCancel := context.WithTimeout(ctx, 10*time.Second)
		defer shutdownCancel()

		// Attempt graceful shutdown
		return a.server.Shutdown(shutdownCtx)
	}
}

// Close cleans up resources used by the application
func (a *App) Close() error {
	if err := a.db.Close(); err != nil {
		return fmt.Errorf("error closing database connection: %w", err)
	}
	return nil
}
