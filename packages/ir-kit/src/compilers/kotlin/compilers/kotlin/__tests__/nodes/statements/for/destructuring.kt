package com.example

fun dump(map: Map<String, Int>) {
  for ((key, value) in map) {
    println("$key=$value")
  }
}
