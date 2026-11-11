package main

import "fmt"

func main() {
	for range [...]int{1, 2} {
		fmt.Println("ok")
	}
}
