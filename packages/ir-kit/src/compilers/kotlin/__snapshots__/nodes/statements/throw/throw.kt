package com.example

fun fail() {
  log("failing")
  throw IllegalStateException("unsupported")
}
