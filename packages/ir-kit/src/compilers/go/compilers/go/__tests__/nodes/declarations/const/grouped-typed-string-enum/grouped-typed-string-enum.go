package main

import "fmt"

type Color string

const (
	ColorRed   Color = "red"
	ColorGreen Color = "green"
	ColorBlue  Color = "blue"
)

func main() {
	fmt.Println(ColorRed)
}
