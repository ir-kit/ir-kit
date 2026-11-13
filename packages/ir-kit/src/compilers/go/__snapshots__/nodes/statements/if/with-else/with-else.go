package main

import "fmt"

func main() {
	x := 1
	if x > 0 {
		fmt.Println("positive")
		return
	} else {
		fmt.Println("not positive")
		return
	}
}
