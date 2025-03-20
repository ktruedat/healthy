package models

// Category represents a disease category
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// CategoryInput represents input for creating/updating a category
type CategoryInput struct {
	Name string `json:"name"`
}
