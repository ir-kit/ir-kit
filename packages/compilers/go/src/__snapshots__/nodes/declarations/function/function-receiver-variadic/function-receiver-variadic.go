package main

import "fmt"

type Some struct{}

func (s Some) Sum(nums ...int) int {
	return 0
}

func main() {
	s := Some{}
	fmt.Println(s.Sum(1, 2, 3))
}
