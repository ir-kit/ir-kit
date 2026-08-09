package com.example

class Box<out T>(
  val value: T,
)

fun <T> pick(value: T): T where T : Comparable<T>, T : Cloneable = value
