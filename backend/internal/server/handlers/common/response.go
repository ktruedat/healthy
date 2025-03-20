package common

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse writes an error response
func ErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := map[string]string{"error": message}

	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		// If we can't encode the error response, log it and send a plain text error
		http.Error(w, "Error encoding JSON response", http.StatusInternalServerError)
	}
}

// JSONResponse writes a JSON response
func JSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			ErrorResponse(w, "Error encoding JSON response", http.StatusInternalServerError)
			return
		}
	}
}
