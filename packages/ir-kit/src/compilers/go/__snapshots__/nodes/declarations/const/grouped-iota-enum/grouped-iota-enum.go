package main

import "fmt"

type Status int

const (
	StatusActive Status = iota
	StatusInactive
	StatusPending
)

func main() {
	fmt.Println(StatusActive)
}
