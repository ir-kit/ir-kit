package main

import "fmt"

func main() {
	x := 42
	p := &x
	v := *p
	fmt.Println(v)
}
