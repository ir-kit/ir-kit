package com.example.petstore.api

import com.example.petstore.models.*
import okhttp3.Response

/** GET /store/inventory */
public suspend fun StoreApi.getInventory(): Map<String, Int> = this.getInventory(options = RequestOptions())

/** GET /store/inventory */
public suspend fun StoreApi.getInventoryWithResponse(): Pair<Map<String, Int>, Response> =
    this.getInventoryWithResponse(options = RequestOptions())

/** POST /store/order */
public suspend fun StoreApi.placeOrder(body: Order): Order = this.placeOrder(body = body, options = RequestOptions())

/** POST /store/order */
public suspend fun StoreApi.placeOrderWithResponse(body: Order): Pair<Order, Response> =
    this.placeOrderWithResponse(body = body, options = RequestOptions())

/** GET /store/order/{orderId} */
public suspend fun StoreApi.getOrderById(orderId: Long): Order = this.getOrderById(orderId = orderId, options = RequestOptions())

/** GET /store/order/{orderId} */
public suspend fun StoreApi.getOrderByIdWithResponse(orderId: Long): Pair<Order, Response> =
    this.getOrderByIdWithResponse(orderId = orderId, options = RequestOptions())

/** DELETE /store/order/{orderId} */
public suspend fun StoreApi.deleteOrder(orderId: Long) {
    this.deleteOrder(orderId = orderId, options = RequestOptions())
}

/** DELETE /store/order/{orderId} */
public suspend fun StoreApi.deleteOrderWithResponse(orderId: Long): Response =
    this.deleteOrderWithResponse(orderId = orderId, options = RequestOptions())

/** POST /shapes */
public suspend fun StoreApi.createShape(body: ByteArray): CreateShape_Response = this.createShape(body = body, options = RequestOptions())

/** POST /shapes */
public suspend fun StoreApi.createShapeWithResponse(body: ByteArray): Pair<CreateShape_Response, Response> =
    this.createShapeWithResponse(body = body, options = RequestOptions())

/** POST /measurements */
public suspend fun StoreApi.submitMeasurement(body: SubmitMeasurement_Body) {
    this.submitMeasurement(body = body, options = RequestOptions())
}

/** POST /measurements */
public suspend fun StoreApi.submitMeasurementWithResponse(body: SubmitMeasurement_Body): Response =
    this.submitMeasurementWithResponse(body = body, options = RequestOptions())
