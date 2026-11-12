package com.example.petstore.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public enum class CircleKind(
    public val raw: String,
) {
    @SerialName("circle")
    CIRCLE("circle"),
}
