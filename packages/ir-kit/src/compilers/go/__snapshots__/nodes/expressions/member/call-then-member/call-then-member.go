package main

import "fmt"

type R struct {
	Field int
}

func get() R {
	return R{Field: 99}
}

func main() {
	result := get().Field
	fmt.Println(result)
}
