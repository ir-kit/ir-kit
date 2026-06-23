package main

import "fmt"

type Person struct {
	Name string
	Age  int
}
type Employee struct {
	Person
	Salary float64
}

func main() {
	e := Employee{Person: Person{Name: "Zoe", Age: 30}, Salary: 1000}
	fmt.Println(e.Name, e.Salary)
}
