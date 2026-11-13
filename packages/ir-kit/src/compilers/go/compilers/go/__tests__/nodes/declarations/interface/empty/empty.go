package main

import "fmt"

type Any interface{}

func main() {
	var x Any = 123

	fmt.Println(x)
}
