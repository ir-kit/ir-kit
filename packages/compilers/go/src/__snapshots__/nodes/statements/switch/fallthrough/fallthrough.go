package main

import "fmt"

func main() {
	x := 42
	switch x {
	case 100:
		fallthrough
	case 42:
		fmt.Println("hit 42")
		fallthrough
	default:
		fmt.Println("after fallthrough")
	}
}
