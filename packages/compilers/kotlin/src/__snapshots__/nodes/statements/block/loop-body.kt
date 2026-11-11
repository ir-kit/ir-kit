package com.example

fun report(items: List<String>) {
  for (item in items) {
    println(item)
    log(item)
  }
}
