package com.example

fun tier(score: Int): String =
  when {
    score > 90 -> "high"
    else -> "low"
  }
