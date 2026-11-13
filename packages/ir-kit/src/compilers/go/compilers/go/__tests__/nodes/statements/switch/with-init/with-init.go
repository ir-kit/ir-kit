package main

import "fmt"

func main() {
	switch cond := true; cond {
	case true:
		fmt.Println("ok")
	}
}
