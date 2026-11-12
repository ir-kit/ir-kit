package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class SubmitTagsBody(
    public val tags: List<String>,
)
