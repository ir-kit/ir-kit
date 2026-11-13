package main

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

func main() {
	fmt.Println(http.MethodGet, uuid.NewString())
}
