package disease

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ktruedat/healthisis/backend/internal/models"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handler handles disease-related requests
type Handler struct {
	service *services.DiseaseService
}

// New creates a new disease handler
func New(service *services.DiseaseService) *Handler {
	return &Handler{service: service}
}

// List handles GET /diseases
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	filter := parseFilterFromQuery(r)

	// Store the original limit for later use
	originalLimit := filter.Limit
	if originalLimit <= 0 {
		originalLimit = 10 // Default limit if not provided
	}

	// Increase the limit by 1 to check if there are more records
	filter.Limit = originalLimit + 1

	diseases, err := h.service.ListDiseases(r.Context(), filter)
	if err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if we got more results than requested
	hasMore := len(diseases) > originalLimit

	// If we have more, remove the extra record before returning
	if hasMore {
		diseases = diseases[:originalLimit]
	}

	// Create a response with both the diseases and pagination info
	response := map[string]any{
		"diseases":   diseases,
		"totalCount": len(diseases), // This is just the count of current page items
		"page":       (filter.Offset / originalLimit) + 1,
		"limit":      originalLimit,
		"hasMore":    hasMore,
	}

	common.JSONResponse(w, http.StatusOK, response)
}

// Get handles GET /diseases/{id}
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "diseaseID")

	disease, err := h.service.GetDiseaseByID(r.Context(), id)
	if err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if disease == nil {
		common.ErrorResponse(w, "Disease not found", http.StatusNotFound)
		return
	}

	common.JSONResponse(w, http.StatusOK, disease)
}

// Create handles POST /diseases
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var disease models.Disease

	if err := json.NewDecoder(r.Body).Decode(&disease); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.CreateDisease(r.Context(), &disease); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusCreated, disease)
}

// Update handles PUT /diseases/{id}
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "diseaseID")
	var disease models.Disease

	if err := json.NewDecoder(r.Body).Decode(&disease); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	disease.ID = id
	if err := h.service.UpdateDisease(r.Context(), &disease); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, disease)
}

// Delete handles DELETE /diseases/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "diseaseID")

	if err := h.service.DeleteDisease(r.Context(), id); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// AddData handles POST /diseases/{id}/data
func (h *Handler) AddData(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "diseaseID")
	var data models.DiseaseData

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	data.DiseaseID = id
	if err := h.service.AddDiseaseData(r.Context(), &data); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusCreated, data)
}

// Predict handles GET /diseases/{id}/predict
func (h *Handler) Predict(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "diseaseID")
	yearStr := r.URL.Query().Get("year")

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		common.ErrorResponse(w, "Invalid year parameter", http.StatusBadRequest)
		return
	}

	prediction, err := h.service.PredictDiseaseCases(r.Context(), id, year)
	if err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, prediction)
}

// parseFilterFromQuery extracts filter parameters from the request query
func parseFilterFromQuery(r *http.Request) models.DiseaseFilter {
	filter := models.DiseaseFilter{}

	// Parse limit and offset
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filter.Limit = limit
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			filter.Offset = offset
		}
	}

	// Parse year filters
	if startYearStr := r.URL.Query().Get("startYear"); startYearStr != "" {
		if startYear, err := strconv.Atoi(startYearStr); err == nil {
			filter.StartYear = &startYear
		}
	}

	if endYearStr := r.URL.Query().Get("endYear"); endYearStr != "" {
		if endYear, err := strconv.Atoi(endYearStr); err == nil {
			filter.EndYear = &endYear
		}
	}

	return filter
}
