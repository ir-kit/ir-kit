package main

import "fmt"

func main() {
	inc := func(x int) int {
		return x + 1
	}
	fmt.Println(inc(5))
}
