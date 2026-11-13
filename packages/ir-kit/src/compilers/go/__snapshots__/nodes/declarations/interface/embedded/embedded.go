package main

import "io"

type ReadWriter interface {
	io.Reader
	Write(p []byte) (n int, err error)
}
