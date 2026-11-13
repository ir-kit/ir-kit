package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum CircleKind {
  CIRCLE("circle");

  private final String value;

  CircleKind(String value) {
    this.value = value;
  }

  @JsonValue
  public String value() {
    return value;
  }
}
