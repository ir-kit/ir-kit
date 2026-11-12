package com.example.petstore.model;

public record User(
    Long id,
    String username,
    String firstName,
    String lastName,
    String email,
    String password,
    String phone,
    Integer userStatus) {}
