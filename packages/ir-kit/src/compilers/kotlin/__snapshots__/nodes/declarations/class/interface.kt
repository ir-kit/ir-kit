package com.example

interface Repository {
  fun findAll(): List<User>

  fun findById(id: String): User?
}
