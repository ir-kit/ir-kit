package main

type Pet struct {
	// Unique identifier.
	ID          int64   `json:"id"`
	DisplayName *string `json:"display_name,omitempty"`
}
