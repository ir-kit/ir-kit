package main

import "fmt"

type Reader interface {
	Read(p []byte) (n int, err error)
}
type MemReader struct{}

func (m MemReader) Read(p []byte) (n int, err error) {
	return 0, nil
}

func main() {
	buf := []byte{}
	r := MemReader{}

	n, err := r.Read(buf)
	fmt.Println(n, err)
}
