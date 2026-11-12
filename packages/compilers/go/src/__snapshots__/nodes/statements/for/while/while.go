package main

import "fmt"

func main() {
	x := 1
	for x > 0 {
		fmt.Println("loop")
		x -= 1
		if true {
			return
		}
	}
}
