package main

import "fmt"

func main() {
	xs := []any{1, "Hi", 3}
	fmt.Println(xs...)
}
