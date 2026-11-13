package com.example

fun grade(score: Int) {
  log(score)
  when {
    score >= 90 -> println("A")
    score >= 80 -> println("B")
    else -> println("F")
  }
}
