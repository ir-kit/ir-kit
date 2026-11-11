package main

import "fmt"

func main() {
	x := 1
	y := 1
	z := 1
	a := 1
	b := 1
	x &= 1
	y |= 1
	z ^= 1
	a >>= 1
	b <<= 1
	fmt.Println(x, y, z, a, b)
}
