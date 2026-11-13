package main

import "fmt"

func main() {
	for i, v := range []int{5, 6} {
		fmt.Println(i, v)
	}
}
