import Foundation

extension StoreAPI {
  /// GET /store/inventory
  public func getInventory() async throws -> [String: Int32] {
    return try await self.getInventory(options: RequestOptions())
  }

  /// GET /store/inventory
  public func getInventoryWithResponse() async throws -> ([String: Int32], HTTPURLResponse) {
    return try await self.getInventoryWithResponse(options: RequestOptions())
  }

  /// POST /store/order
  public func placeOrder(body: Order) async throws -> Order {
    return try await self.placeOrder(body: body, options: RequestOptions())
  }

  /// POST /store/order
  public func placeOrderWithResponse(body: Order) async throws -> (Order, HTTPURLResponse) {
    return try await self.placeOrderWithResponse(body: body, options: RequestOptions())
  }

  /// GET /store/order/{orderId}
  public func getOrderById(orderId: Int64) async throws -> Order {
    return try await self.getOrderById(orderId: orderId, options: RequestOptions())
  }

  /// GET /store/order/{orderId}
  public func getOrderByIdWithResponse(orderId: Int64) async throws -> (Order, HTTPURLResponse) {
    return try await self.getOrderByIdWithResponse(orderId: orderId, options: RequestOptions())
  }

  /// DELETE /store/order/{orderId}
  public func deleteOrder(orderId: Int64) async throws {
    try await self.deleteOrder(orderId: orderId, options: RequestOptions())
  }

  /// DELETE /store/order/{orderId}
  public func deleteOrderWithResponse(orderId: Int64) async throws -> HTTPURLResponse {
    return try await self.deleteOrderWithResponse(orderId: orderId, options: RequestOptions())
  }

  /// POST /shapes
  public func createShape(body: Data) async throws -> CreateShape_Response {
    return try await self.createShape(body: body, options: RequestOptions())
  }

  /// POST /shapes
  public func createShapeWithResponse(
    body: Data
  ) async throws -> (CreateShape_Response, HTTPURLResponse) {
    return try await self.createShapeWithResponse(body: body, options: RequestOptions())
  }

  /// POST /measurements
  public func submitMeasurement(body: SubmitMeasurement_Body) async throws {
    try await self.submitMeasurement(body: body, options: RequestOptions())
  }

  /// POST /measurements
  public func submitMeasurementWithResponse(
    body: SubmitMeasurement_Body
  ) async throws -> HTTPURLResponse {
    return try await self.submitMeasurementWithResponse(body: body, options: RequestOptions())
  }
}
