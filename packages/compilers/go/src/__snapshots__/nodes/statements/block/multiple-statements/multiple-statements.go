package main

import "fmt"

func multiple() int {
	x := 5
	y := 10
	result := 0
	result = x + y
	return result
}

func main() {
	fmt.Println(multiple())
}
