package main

import "context"

type PetAPI interface {
	// Errors are values.
	error
	// GET /pet/{id}
	GetPet(ctx context.Context) error
}
