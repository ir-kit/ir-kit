package main

import "fmt"

func main() {
	a := [4]int{10, 20, 30, 40}
	j := 2
	v := a[:j]
	fmt.Println(v)
}
