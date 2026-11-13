package main

import "fmt"

func print() string {
	for i := 0; i < 5; i++ {
		fmt.Printf("Iteration number: %v\n", i)
		break
		return "this is not returned"
	}
	return "this is returned"
}

func main() {
	fmt.Println(print())
}
