package handlers

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
)

//go:embed swagger-ui
var swaggerUIContent embed.FS

// ServeSwaggerUI serves the Swagger UI interface for API documentation
func ServeSwaggerUI(r chi.Router) {
	// Create a filesystem that's rooted at the swagger-ui directory
	fsys, err := fs.Sub(swaggerUIContent, "swagger-ui")
	if err != nil {
		panic("Failed to create sub-filesystem for swagger-ui: " + err.Error())
	}

	fileServer := http.FileServer(http.FS(fsys))

	// Direct handler for /docs - serve index.html directly
	r.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
		// Read the index.html content directly
		content, err := fs.ReadFile(fsys, "index.html")
		if err != nil {
			http.Error(w, "Could not find Swagger UI index file", http.StatusNotFound)
			return
		}

		// Set the content type and serve the HTML
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(content)
	})

	// Support for assets (CSS, JS files) when accessing from /docs
	r.Get("/swagger-ui/{file}", func(w http.ResponseWriter, r *http.Request) {
		file := chi.URLParam(r, "file")
		content, err := fs.ReadFile(fsys, file)
		if err != nil {
			http.Error(w, "Asset not found", http.StatusNotFound)
			return
		}

		// Set appropriate content type based on file extension
		switch {
		case strings.HasSuffix(file, ".css"):
			w.Header().Set("Content-Type", "text/css")
		case strings.HasSuffix(file, ".js"):
			w.Header().Set("Content-Type", "application/javascript")
		case strings.HasSuffix(file, ".png"):
			w.Header().Set("Content-Type", "image/png")
		}

		w.Write(content)
	})

	// Handle all /swagger requests
	r.Get("/swagger", func(w http.ResponseWriter, r *http.Request) {
		// Redirect /swagger to /swagger/
		http.Redirect(w, r, "/api/v1/swagger/", http.StatusMovedPermanently)
	})

	r.Get("/swagger/", func(w http.ResponseWriter, r *http.Request) {
		// Serve the index.html directly
		r.URL.Path = "index.html"
		fileServer.ServeHTTP(w, r)
	})

	r.Get("/swagger/*", func(w http.ResponseWriter, r *http.Request) {
		// Get the file path by trimming the prefix
		path := strings.TrimPrefix(r.URL.Path, "/api/v1/swagger/")

		// Avoid redirect loops by modifying the request
		r.URL.Path = path
		fileServer.ServeHTTP(w, r)
	})

	// Serve the OpenAPI spec with no-cache headers
	r.Get("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		// Get the project root
		projectRoot := lookupProjectRoot()
		openapiPath := filepath.Join(projectRoot, "openapi.yaml")

		// Check if file exists
		if _, err := os.Stat(openapiPath); os.IsNotExist(err) {
			http.Error(w, "OpenAPI specification not found", http.StatusNotFound)
			return
		}

		// Set headers to prevent caching
		w.Header().Set("Content-Type", "text/yaml")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")

		// Serve the OpenAPI file
		http.ServeFile(w, r, openapiPath)
	})
}

// lookupProjectRoot attempts to find the project root directory
func lookupProjectRoot() string {
	// Start with the current working directory
	dir, err := os.Getwd()
	if err != nil {
		return "." // Fallback to current directory if we can't get working dir
	}

	// Walk up the directory tree looking for a marker file
	for {
		// Check for openapi.yaml directly
		if _, err := os.Stat(filepath.Join(dir, "openapi.yaml")); err == nil {
			return dir
		}

		// Go up one directory
		parentDir := filepath.Dir(dir)

		// If we reached the filesystem root, stop searching
		if parentDir == dir {
			return "." // Return current directory as fallback
		}

		dir = parentDir
	}
}
