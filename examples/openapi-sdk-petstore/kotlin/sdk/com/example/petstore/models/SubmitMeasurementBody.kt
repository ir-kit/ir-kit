package com.example.petstore.models

import kotlinx.serialization.Serializable

@Serializable
public data class SubmitMeasurementBody(
    public val value: Double,
)
