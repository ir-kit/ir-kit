package main

type Number interface {
	~int | ~float64
}

func double[T Number](x T) T {
	return x + x
}

func main() {}
