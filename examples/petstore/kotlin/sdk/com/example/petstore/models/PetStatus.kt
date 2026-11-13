package com.example.petstore.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public enum class PetStatus(
    public val raw: String,
) {
    @SerialName("available")
    AVAILABLE("available"),

    @SerialName("pending")
    PENDING("pending"),

    @SerialName("sold")
    SOLD("sold"),
}
