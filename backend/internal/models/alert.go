package models

import "time"

// Alert represents a disease alert notification
type Alert struct {
	ID        int       `json:"id"`
	DiseaseID int       `json:"disease_id"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
}

// AlertInput represents input for creating a new alert
type AlertInput struct {
	DiseaseID int       `json:"disease_id"`
	Severity  string    `json:"severity"`
	Message   string    `json:"message"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
}
