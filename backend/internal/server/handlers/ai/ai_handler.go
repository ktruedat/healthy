package ai

import (
	"encoding/json"
	"net/http"

	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handler handles AI-related requests
type Handler struct {
	service *services.AIService
}

// New creates a new AI handler
func New(service *services.AIService) *Handler {
	return &Handler{service: service}
}

// Query handles POST /query for AI-powered natural language querying
func (h *Handler) Query(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Question string `json:"question"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.ErrorResponse(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	if req.Question == "" {
		common.ErrorResponse(w, "Question text is required", http.StatusBadRequest)
		return
	}

	// Process the natural language query
	result, err := h.service.ProcessQuery(r.Context(), req.Question)
	if err != nil {
		common.ErrorResponse(w, "Error processing AI query: "+err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, result)
}
