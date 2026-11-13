import Foundation

public struct CreateShapeResponse: Codable {
  public let id: UUID?

  public init(id: UUID? = nil) {
    self.id = id
  }
}
