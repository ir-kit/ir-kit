package com.example

sealed class Result {
  data class Success(
    val data: String,
  ) : Result()

  data class Failure(
    val error: String,
  ) : Result()
}
