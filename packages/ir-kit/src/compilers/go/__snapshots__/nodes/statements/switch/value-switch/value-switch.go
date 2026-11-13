package main

import "fmt"

func main() {
	x := 2
	switch x {
	case 0:
		fmt.Println("zero")
	case 1, 2:
		fmt.Println("one or two")
	default:
		fmt.Println("other")
	}
}
