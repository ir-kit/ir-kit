package main

import "fmt"

type Stack[T any] []T

func main() {
	s := Stack[int]{}
	fmt.Println(s)
}
