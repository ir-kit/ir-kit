package com.example.petstore.api;

import com.example.petstore.model.CreateShapeResponse;
import com.example.petstore.model.Order;
import com.example.petstore.model.SubmitMeasurementBody;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.RequestOptions;
import java.util.Map;

public interface StoreApi {
  // GET /store/inventory
  Map<String, Integer> getInventory(RequestOptions options);

  default Map<String, Integer> getInventory() {
    return this.getInventory(RequestOptions.defaults());
  }

  // GET /store/inventory
  ApiResult<Map<String, Integer>> getInventoryWithResponse(RequestOptions options);

  default ApiResult<Map<String, Integer>> getInventoryWithResponse() {
    return this.getInventoryWithResponse(RequestOptions.defaults());
  }

  // POST /store/order
  Order placeOrder(Order body, RequestOptions options);

  default Order placeOrder(Order body) {
    return this.placeOrder(body, RequestOptions.defaults());
  }

  // POST /store/order
  ApiResult<Order> placeOrderWithResponse(Order body, RequestOptions options);

  default ApiResult<Order> placeOrderWithResponse(Order body) {
    return this.placeOrderWithResponse(body, RequestOptions.defaults());
  }

  // GET /store/order/{orderId}
  Order getOrderById(Long orderId, RequestOptions options);

  default Order getOrderById(Long orderId) {
    return this.getOrderById(orderId, RequestOptions.defaults());
  }

  // GET /store/order/{orderId}
  ApiResult<Order> getOrderByIdWithResponse(Long orderId, RequestOptions options);

  default ApiResult<Order> getOrderByIdWithResponse(Long orderId) {
    return this.getOrderByIdWithResponse(orderId, RequestOptions.defaults());
  }

  // DELETE /store/order/{orderId}
  void deleteOrder(Long orderId, RequestOptions options);

  default void deleteOrder(Long orderId) {
    this.deleteOrder(orderId, RequestOptions.defaults());
  }

  // DELETE /store/order/{orderId}
  ApiResult<Void> deleteOrderWithResponse(Long orderId, RequestOptions options);

  default ApiResult<Void> deleteOrderWithResponse(Long orderId) {
    return this.deleteOrderWithResponse(orderId, RequestOptions.defaults());
  }

  // POST /shapes
  CreateShapeResponse createShape(byte[] body, RequestOptions options);

  default CreateShapeResponse createShape(byte[] body) {
    return this.createShape(body, RequestOptions.defaults());
  }

  // POST /shapes
  ApiResult<CreateShapeResponse> createShapeWithResponse(byte[] body, RequestOptions options);

  default ApiResult<CreateShapeResponse> createShapeWithResponse(byte[] body) {
    return this.createShapeWithResponse(body, RequestOptions.defaults());
  }

  // POST /measurements
  void submitMeasurement(SubmitMeasurementBody body, RequestOptions options);

  default void submitMeasurement(SubmitMeasurementBody body) {
    this.submitMeasurement(body, RequestOptions.defaults());
  }

  // POST /measurements
  ApiResult<Void> submitMeasurementWithResponse(SubmitMeasurementBody body, RequestOptions options);

  default ApiResult<Void> submitMeasurementWithResponse(SubmitMeasurementBody body) {
    return this.submitMeasurementWithResponse(body, RequestOptions.defaults());
  }
}
