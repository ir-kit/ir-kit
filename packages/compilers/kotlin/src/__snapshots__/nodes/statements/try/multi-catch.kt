package com.example

fun parse(input: String) {
  try {
    decode(input)
  } catch (e: NumberFormatException) {
    fallback()
  } catch (e: IllegalStateException) {
    reset()
  }
}
