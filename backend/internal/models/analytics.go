package models

import "time"

// CorrelationRequest represents parameters for correlation analysis
type CorrelationRequest struct {
	Factor1   string          `json:"factor1"`
	Factor2   string          `json:"factor2"`
	Timeframe TimeframeFilter `json:"timeframe"`
}

// TimeframeFilter defines a time period for analysis
type TimeframeFilter struct {
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

// CorrelationResult represents the results of a correlation analysis
type CorrelationResult struct {
	CorrelationCoefficient float64      `json:"correlation_coefficient"`
	PValue                 float64      `json:"p_value"`
	ConfidenceInterval     ConfInterval `json:"confidence_interval"`
	VisualizationData      interface{}  `json:"visualization_data"`
}

// ConfInterval represents a statistical confidence interval
type ConfInterval struct {
	Lower float64 `json:"lower"`
	Upper float64 `json:"upper"`
}

// DiseaseData represents time-based disease occurrence data
type DiseaseData struct {
	ID         string  `json:"id,omitempty"`
	DiseaseID  string  `json:"disease_id"`
	Year       int     `json:"year"`
	Quarter    int     `json:"quarter"`
	Cases      int     `json:"cases"`
	Prevalence float64 `json:"prevalence"`
	Incidence  float64 `json:"incidence"`
	Notes      string  `json:"notes,omitempty"`
}

// DiseaseComparison represents data for comparing disease across years
type DiseaseComparison struct {
	Disease string                   `json:"disease"`
	Data    []DiseaseComparisonPoint `json:"data"`
}

// DiseaseComparisonPoint represents data for a single year in comparison
type DiseaseComparisonPoint struct {
	Year  int `json:"year"`
	Cases int `json:"cases"`
}

// DiseasePrediction represents disease prediction results
type DiseasePrediction struct {
	Year             int `json:"year"`
	Q1PredictedCases int `json:"q1_predicted_cases"`
	Q2PredictedCases int `json:"q2_predicted_cases"`
	Q3PredictedCases int `json:"q3_predicted_cases"`
	Q4PredictedCases int `json:"q4_predicted_cases"`
}

// QueryResult represents an AI query response
type QueryResult struct {
	Answer      string      `json:"answer"`
	Data        interface{} `json:"data,omitempty"`
	Explanation string      `json:"explanation,omitempty"`
}
