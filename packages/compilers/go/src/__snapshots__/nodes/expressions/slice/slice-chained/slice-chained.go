package main

import "fmt"

type T struct{}

func (t T) Foo() []int {
	return []int{1, 2, 3, 4}
}

func main() {
	a := []T{T{}, T{}}
	i := 0
	k := 1
	l := 3
	v := a[i].Foo()[k:l]
	fmt.Println(v)
}
