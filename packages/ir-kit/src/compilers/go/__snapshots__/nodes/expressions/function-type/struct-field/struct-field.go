package main

import "fmt"

type Client struct {
	Editor func(int) error
}

func main() {
	c := Client{}
	fmt.Println(c)
}
