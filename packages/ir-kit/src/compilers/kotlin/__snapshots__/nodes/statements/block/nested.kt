package com.example

fun loop() {
  while (running) {
    if (ready) {
      handle()
    }
  }
}
