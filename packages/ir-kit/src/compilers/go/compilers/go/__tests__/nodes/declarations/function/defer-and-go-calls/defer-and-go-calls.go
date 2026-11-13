package main

import "fmt"

func run() {
	go work()
	fmt.Println("running")
	return
}

func work() {}

func main() {
	run()
}
