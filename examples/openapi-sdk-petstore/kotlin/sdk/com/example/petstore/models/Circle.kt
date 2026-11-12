package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class Circle(
    public val kind: CircleKind,
    public val radius: Double,
)
