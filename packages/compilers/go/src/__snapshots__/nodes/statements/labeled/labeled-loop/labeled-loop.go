package main

import "fmt"

func main() {
Outer:
	for i := range 3 {
		for j := range 3 {
			if j == 1 {
				continue Outer
			}
			if i == 2 {
				break Outer
			}
			fmt.Println(i, j)
		}
	}
}
