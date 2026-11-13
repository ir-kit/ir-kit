package main

type A int
type B string

type C struct {
	X int
}

type D int

func (C) isMarker() {}
