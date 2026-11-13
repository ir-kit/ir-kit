package com.example

object DefaultLogger : Logger {
  override fun log(message: String) {
    println(message)
  }
}
