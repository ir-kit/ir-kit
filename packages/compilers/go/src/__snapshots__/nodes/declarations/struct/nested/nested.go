package main

import "fmt"

type Address struct {
	City string `json:"city"`
}
type User struct {
	Name    string `json:"name"`
	Address struct {
		City string `json:"city"`
	} `json:"address"`
}

func main() {
	u := User{Name: "Eve", Address: Address{City: "Paris"}}
	fmt.Println(u.Name, u.Address.City)
}
