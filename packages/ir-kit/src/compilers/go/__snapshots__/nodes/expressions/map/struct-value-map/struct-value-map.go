package main

import "fmt"

var x = map[string]struct {
	Name string
	Age  int
}{"alice": {Name: "Alice", Age: 30}, "bob": {Name: "Bob", Age: 25}}

func main() {
	fmt.Println(x)
}
