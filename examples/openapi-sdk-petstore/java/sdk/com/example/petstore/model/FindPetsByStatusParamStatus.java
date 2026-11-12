package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FindPetsByStatusParamStatus {
  AVAILABLE("available"),
  PENDING("pending"),
  SOLD("sold");

  private final String value;

  FindPetsByStatusParamStatus(String value) {
    this.value = value;
  }

  @JsonValue
  public String value() {
    return value;
  }
}
