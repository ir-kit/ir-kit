package com.example

fun safe() {
  try {
    risky()
  } catch (e: Exception) {
    handle(e)
  } finally {
    cleanup()
  }
}
