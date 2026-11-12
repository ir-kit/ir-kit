package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class SubmitTagsResponse(
    public val count: Int? = null,
)
