package main

import "fmt"

type B struct {
	c int
}

type A struct {
	b B
}

func main() {
	a := A{b: B{c: 7}}
	result := a.b.c
	fmt.Println(result)
}
