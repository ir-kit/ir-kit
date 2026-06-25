package main

import "fmt"

type User struct {
	Name  *string `json:"name,omitempty"`
	Owner *User   `json:"owner,omitempty"`
}

func main() {
	name := "Bob"
	u := User{Name: &name}
	fmt.Println(u)
}
