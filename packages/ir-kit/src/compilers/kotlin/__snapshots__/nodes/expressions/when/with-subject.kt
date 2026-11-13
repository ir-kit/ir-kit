package com.example

fun label(code: Int): String =
  when (code) {
    200 -> "ok"
    404 -> "missing"
    else -> "unknown"
  }
