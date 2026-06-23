package main

import "fmt"

type Shape interface {
	Area() float64
	Scale(factor float64)
	Move(x int, y int)
}
type Rectangle struct {
	W float64
	H float64
}

func (r Rectangle) Area() float64 {
	return r.W * r.H * 0.5
}

func (r Rectangle) Scale(factor float64) {
	r.W *= factor
	r.H *= factor
}

func (r Rectangle) Move(x int, y int) {
	fmt.Printf("Moved to (%d, %d)", x, y)
}

func main() {
	s := Rectangle{W: 3, H: 4}
	s.Scale(2)
	fmt.Println(s.Area())
	s.Move(1, 2)
}
