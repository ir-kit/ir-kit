package com.example

fun log(
  level: String? = null,
  vararg messages: String,
) {
  emit(*messages)
}
