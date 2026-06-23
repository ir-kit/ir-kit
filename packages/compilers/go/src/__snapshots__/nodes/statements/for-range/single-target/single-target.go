package main

import "fmt"

func main() {
	for v := range []int{3, 4} {
		fmt.Println(v)
	}
}
