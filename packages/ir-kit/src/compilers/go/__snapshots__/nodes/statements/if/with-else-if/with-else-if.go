package main

import "fmt"

func main() {
	x := 0
	if x > 0 {
		fmt.Println("positive")
		return
	} else if x < 0 {
		fmt.Println("negative")
		return
	} else {
		fmt.Println("zero")
		return
	}
}
