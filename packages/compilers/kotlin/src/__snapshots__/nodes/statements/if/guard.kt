package com.example

fun notify(enabled: Boolean) {
  if (!enabled) return
  send()
}
