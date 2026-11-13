package main

import "fmt"

func find(id *int) *User {
	return nil
}

func main() {
	id := 1
	fmt.Println(find(&id))
}
