package com.example.petstore.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum RectKind {
  RECT("rect");

  private final String value;

  RectKind(String value) {
    this.value = value;
  }

  @JsonValue
  public String value() {
    return value;
  }
}
