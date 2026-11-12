package main

import "fmt"

type T struct{}

func (t T) Do() int {
	return 42
}

func main() {
	obj := []T{T{}, T{}}
	i := 0
	v := obj[i].Do()
	fmt.Println(v)
}
