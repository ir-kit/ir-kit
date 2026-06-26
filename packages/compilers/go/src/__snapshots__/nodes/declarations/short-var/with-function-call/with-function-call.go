package main

import "fmt"

func calculate(a int, b int) int {
	return a + b
}

func main() {
	result := calculate(5, 10)
	fmt.Println(result)
}
