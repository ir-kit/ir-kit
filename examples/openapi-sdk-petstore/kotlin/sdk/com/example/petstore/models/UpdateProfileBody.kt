package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class UpdateProfileBody(
    public val name: String,
    public val nickname: String? = null,
)
