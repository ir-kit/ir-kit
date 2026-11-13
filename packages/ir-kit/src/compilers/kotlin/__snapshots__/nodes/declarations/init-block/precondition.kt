package com.example

class Range(
  val start: Int,
) {
  init {
    require(start >= 0)
  }
}
