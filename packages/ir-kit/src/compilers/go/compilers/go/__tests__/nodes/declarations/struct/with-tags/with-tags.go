package main

import "fmt"

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name,omitempty"`
}

func main() {
	u := User{ID: 1, Name: "Bob"}
	fmt.Println(u)
}
