package main

import "fmt"

func main() {
	v := 5
	switch x := any(v).(type) {
	case int:
		fmt.Printf("int %v\n", x)
	case string:
		fmt.Printf("string %v\n", x)
	default:
		fmt.Printf("unknown %v\n", x)
	}
}
