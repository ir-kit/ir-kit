package main

import "fmt"

var (
	host    = "localhost"
	port    = 8080
	enabled bool
)

func main() {
	fmt.Println(host, port, enabled)
}
