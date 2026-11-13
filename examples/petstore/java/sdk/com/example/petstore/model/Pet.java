package com.example.petstore.model;

import java.util.List;

public record Pet(
    Long id,
    String name,
    Category category,
    List<String> photoUrls,
    List<Tag> tags,
    PetStatus status) {}
