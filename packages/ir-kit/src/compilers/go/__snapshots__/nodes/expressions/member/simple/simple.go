package main

import "fmt"

type Obj struct {
	field int
}

func main() {
	obj := Obj{field: 5}
	result := obj.field
	fmt.Println(result)
}
