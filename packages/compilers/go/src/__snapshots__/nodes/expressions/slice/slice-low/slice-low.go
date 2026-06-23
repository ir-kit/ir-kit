package main

import "fmt"

func main() {
	a := [4]int{10, 20, 30, 40}
	i := 2
	v := a[i:]
	fmt.Println(v)
}
