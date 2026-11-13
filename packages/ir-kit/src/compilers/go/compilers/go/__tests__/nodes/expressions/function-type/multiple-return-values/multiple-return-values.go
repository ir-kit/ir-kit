package main

import "fmt"

type Handler func() (int, error)

func main() {
	var h Handler
	fmt.Println(h)
}
