package main

import "fmt"

func getValue() (int, int, int) {
	return 42, 43, 44
}

func main() {
	x, y, z := getValue()
	fmt.Println(x, y, z)
}
