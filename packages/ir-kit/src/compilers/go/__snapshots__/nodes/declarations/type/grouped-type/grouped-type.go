package main

import "fmt"

type (
	UserID  int
	Celsius float64
	Name    string
)

func main() {
	var id UserID = 1
	fmt.Println(id)
}
