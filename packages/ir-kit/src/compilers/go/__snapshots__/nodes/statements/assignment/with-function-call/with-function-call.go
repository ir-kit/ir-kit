package main

import "fmt"

func getValue() int {
	return 42
}

func main() {
	value := 0
	value = getValue()
	fmt.Println(value)
}
