package main

import "fmt"

const Debug bool = true

func main() {
	if Debug {
		fmt.Println("Debug mode")
	} else {
		fmt.Println("Normal mode")
	}
}
