package com.example.petstore.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
public data class Order(
    public val id: Long? = null,
    public val petId: Long? = null,
    public val quantity: Int? = null,
    public val shipDate: Instant? = null,
    public val status: OrderStatus? = null,
    public val complete: Boolean? = null,
)
