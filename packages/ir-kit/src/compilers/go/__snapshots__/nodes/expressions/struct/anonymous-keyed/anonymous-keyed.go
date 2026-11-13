package main

import "fmt"

func main() {
	v := struct {
		A int
		B string
	}{A: 1, B: "hi"}
	fmt.Println(v)
}
