package main

func relay(in chan int, out chan int) {
	v := <-in
	out <- v
}
