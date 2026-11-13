package com.example

fun validate(value: Int) {
  if (value < 0) throw IllegalArgumentException("negative")
  store(value)
}
