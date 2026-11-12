package com.example.petstore.model;

import java.time.OffsetDateTime;

public record Order(
    Long id,
    Long petId,
    Integer quantity,
    OffsetDateTime shipDate,
    OrderStatus status,
    Boolean complete) {}
