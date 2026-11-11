package main

import "fmt"

func worker(ch chan int, done chan bool) {
	select {
	case v := <-ch:
		fmt.Println(v)
	case done <- true:
		fmt.Println("done")
	default:
		fmt.Println("waiting")
	}
}

func main() {}
