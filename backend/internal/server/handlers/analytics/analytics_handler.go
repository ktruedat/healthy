package analytics

import (
	"encoding/json"
	"net/http"

	"github.com/ktruedat/healthisis/backend/internal/models"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handler handles analytics-related requests
type Handler struct {
	service *services.AnalyticsService
}

// New creates a new analytics handler
func New(service *services.AnalyticsService) *Handler {
	return &Handler{service: service}
}

// Correlation handles POST /analytics/correlation
func (h *Handler) Correlation(w http.ResponseWriter, r *http.Request) {
	var req models.CorrelationRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.ErrorResponse(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Factor1 == "" || req.Factor2 == "" {
		common.ErrorResponse(w, "Both factor1 and factor2 are required", http.StatusBadRequest)
		return
	}

	if req.Timeframe.StartDate.IsZero() || req.Timeframe.EndDate.IsZero() {
		common.ErrorResponse(w, "Valid start_date and end_date are required in timeframe", http.StatusBadRequest)
		return
	}

	result, err := h.service.AnalyzeCorrelation(r.Context(), &req)
	if err != nil {
		common.ErrorResponse(w, "Error analyzing correlation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, result)
}

// Forecast handles POST /analytics/forecast
func (h *Handler) Forecast(w http.ResponseWriter, r *http.Request) {
	var params map[string]interface{}

	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		common.ErrorResponse(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required parameters
	if _, ok := params["disease_id"]; !ok {
		common.ErrorResponse(w, "disease_id is required", http.StatusBadRequest)
		return
	}

	if _, ok := params["year"]; !ok {
		common.ErrorResponse(w, "year is required", http.StatusBadRequest)
		return
	}

	forecast, err := h.service.GetDiseaseForecast(r.Context(), params)
	if err != nil {
		common.ErrorResponse(w, "Error generating forecast: "+err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, forecast)
}

// Query handles POST /analytics/query
func (h *Handler) Query(w http.ResponseWriter, r *http.Request) {
	var query models.DiseaseQuery

	if err := json.NewDecoder(r.Body).Decode(&query); err != nil {
		common.ErrorResponse(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	if query.Query == "" {
		common.ErrorResponse(w, "Query text is required", http.StatusBadRequest)
		return
	}

	// Use the analytics service to process the query
	// This is different from AI queries which might use more advanced NLP
	result, err := h.service.ProcessAnalyticsQuery(r.Context(), query.Query)
	if err != nil {
		common.ErrorResponse(w, "Error processing analytics query: "+err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, result)
}
