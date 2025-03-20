package system

import (
	"net/http"
	"runtime"
	"time"

	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
)

// Handler handles system-related requests
type Handler struct {
	startTime time.Time
}

// New creates a new system handler
func New() *Handler {
	return &Handler{
		startTime: time.Now(),
	}
}

// HealthCheck handles GET /health
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"status":      "ok",
		"uptime":      time.Since(h.startTime).String(),
		"go_version":  runtime.Version(),
		"go_routines": runtime.NumGoroutine(),
		"timestamp":   time.Now().Format(time.RFC3339),
	}

	common.JSONResponse(w, http.StatusOK, status)
}
