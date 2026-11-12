package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class UpdateProfileResponse(
    public val ok: Boolean? = null,
)
