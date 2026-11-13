package main

import "fmt"

type Option func(int) error

func main() {
	var opt Option
	fmt.Println(opt)
}
