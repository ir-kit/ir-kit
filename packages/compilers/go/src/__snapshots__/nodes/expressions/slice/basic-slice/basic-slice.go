package main

import "fmt"

func main() {
	a := [4]int{10, 20, 30, 40}
	i := 1
	j := 3
	v := a[i:j]
	fmt.Println(v)
}
