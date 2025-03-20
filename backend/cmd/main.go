package main

import (
	"flag"
	"log"

	"github.com/ktruedat/healthisis/backend/internal/app"
)

func main() {
	// Command-line flags
	configPath := flag.String("config", "", "Path to configuration file")
	flag.Parse()

	// Create new application
	application, err := app.New(*configPath)
	if err != nil {
		log.Fatalf("Error initializing application: %v", err)
	}
	defer application.Close()

	// Start the application
	if err := application.Run(); err != nil {
		log.Fatalf("Error running application: %v", err)
	}
}
