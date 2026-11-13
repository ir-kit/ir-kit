package main

import "fmt"

func add(a int, b int, c int) int {
	return a + b + c
}

func main() {
	fmt.Println(add(5, 10, 1))
}
