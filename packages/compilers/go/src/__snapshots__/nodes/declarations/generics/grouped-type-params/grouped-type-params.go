package main

import "fmt"

type Pair[T, U any] struct {
	First  T
	Second U
}

func main() {
	var p Pair[string, int]
	fmt.Println(p)
}
