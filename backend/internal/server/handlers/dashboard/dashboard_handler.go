package dashboard

import (
	"net/http"

	"github.com/ktruedat/healthisis/backend/internal/models"
	"github.com/ktruedat/healthisis/backend/internal/server/handlers/common"
	"github.com/ktruedat/healthisis/backend/internal/services"
)

// Handler handles dashboard-related requests
type Handler struct {
	service *services.DiseaseService
}

// New creates a new dashboard handler
func New(service *services.DiseaseService) *Handler {
	return &Handler{service: service}
}

// Summary handles GET /dashboard/summary
func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	var filter models.DiseaseFilter
	// extract the diseaseID from the url query param
	diseaseID := r.URL.Query().Get("diseaseID")
	if diseaseID != "" {
		filter.DiseaseIDs = []string{diseaseID}
	}

	summary, err := h.service.GetDiseaseStats(r.Context(), filter)
	if err != nil {
		common.ErrorResponse(w, "Error retrieving dashboard summary: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if diseaseID != "" {
		// Add disease ID to the response
		response := map[string]interface{}{
			"diseaseID": diseaseID,
			"summary":   summary,
		}

		common.JSONResponse(w, http.StatusOK, response)
		return
	}

	common.JSONResponse(w, http.StatusOK, summary)
}

// Trends handles GET /dashboard/trends
func (h *Handler) Trends(w http.ResponseWriter, r *http.Request) {
	trends, err := h.service.GetTimeSeries(r.Context(), models.DiseaseFilter{})
	if err != nil {
		common.ErrorResponse(w, "Error retrieving disease trends: "+err.Error(), http.StatusInternalServerError)
		return
	}

	common.JSONResponse(w, http.StatusOK, trends)
}

// Map handles GET /dashboard/map
func (h *Handler) Map(w http.ResponseWriter, r *http.Request) {
	// This would typically return geographic distribution of diseases
	// For now, we'll return mock data
	geoData := map[string]interface{}{
		"regions": []map[string]interface{}{
			{
				"name":     "Chisinau",
				"cases":    1245,
				"lat":      47.0105,
				"lon":      28.8638,
				"diseases": []string{"Influenza", "COVID-19", "Tuberculosis"},
			},
			{
				"name":     "Balti",
				"cases":    532,
				"lat":      47.7619,
				"lon":      27.9294,
				"diseases": []string{"Influenza", "Hepatitis A"},
			},
			{
				"name":     "Tiraspol",
				"cases":    348,
				"lat":      46.8403,
				"lon":      29.6433,
				"diseases": []string{"COVID-19", "Tuberculosis"},
			},
		},
	}

	common.JSONResponse(w, http.StatusOK, geoData)
}
