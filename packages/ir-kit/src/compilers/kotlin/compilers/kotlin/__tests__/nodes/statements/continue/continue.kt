package com.example

fun scan(items: List<Int>) {
  for (item in items) {
    if (skip) continue
    process(item)
  }
}
