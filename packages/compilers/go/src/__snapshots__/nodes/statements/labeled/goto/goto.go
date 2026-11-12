package main

import "fmt"

func main() {
	i := 0
Retry:
	if i < 3 {
		fmt.Println(i)
		i++
		goto Retry
	}
}
