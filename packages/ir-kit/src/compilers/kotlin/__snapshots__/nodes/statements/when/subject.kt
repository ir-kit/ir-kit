package com.example

fun describe(n: Int) {
  log(n)
  when (n) {
    0 -> println("zero")
    1 -> println("one")
    else -> println("other")
  }
}
