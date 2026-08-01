package com.example

class Config(
  val raw: String,
) {
  init {
    require(raw.isNotEmpty())
    println(raw)
  }
}
