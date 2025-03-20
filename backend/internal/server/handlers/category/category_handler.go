package category

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ktruedat/healthisis/backend/internal/models"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handler handles category-related requests
type Handler struct {
	service *services.CategoryService
}

// New creates a new category handler
func New(service *services.CategoryService) *Handler {
	return &Handler{service: service}
}

// List handles GET /categories
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	categories, err := h.service.GetCategories(r.Context())
	if err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, categories)
}

// Create handles POST /categories
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var category models.Category

	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.CreateCategory(r.Context(), &category); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusCreated, category)
}

// Update handles PUT /categories/{id}
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "categoryID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	var category models.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	category.ID = id
	if err := h.service.UpdateCategory(r.Context(), &category); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, category)
}

// Delete handles DELETE /categories/{id}
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "categoryID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteCategory(r.Context(), id); err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetDiseases handles GET /categories/{id}/diseases
func (h *Handler) GetDiseases(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "categoryID")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ErrorResponse(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	diseases, err := h.service.GetDiseasesByCategory(r.Context(), id)
	if err != nil {
		common.ErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, diseases)
}
