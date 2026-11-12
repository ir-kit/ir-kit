package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PetStatus {
  AVAILABLE("available"),
  PENDING("pending"),
  SOLD("sold");

  private final String value;

  PetStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String value() {
    return value;
  }
}
