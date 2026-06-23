package main

import "fmt"

func inner(s string) string {
	return s
}

func outer(s string) string {
	return s + "!"
}

func main() {
	fmt.Println(outer(inner("test")))
}
