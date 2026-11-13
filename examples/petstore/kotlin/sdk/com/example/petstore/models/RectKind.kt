package com.example.petstore.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
public enum class RectKind(
    public val raw: String,
) {
    @SerialName("rect")
    RECT("rect"),
}
