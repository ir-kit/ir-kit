package main

import "fmt"

func single() int {
	x := 0
	x = 1
	return x
}

func main() {
	fmt.Println(single())
}
