package main

import "fmt"

func main() {
	v := struct {
		A int
		B string
	}{1, "hi"}
	fmt.Println(v)
}
