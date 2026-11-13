package com.example

enum class Status(
  val raw: String,
) {
  @SerialName("active")
  ACTIVE("active"),

  @SerialName("pending")
  PENDING("pending"),
}
