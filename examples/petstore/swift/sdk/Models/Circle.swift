import Foundation

public struct Circle: Codable {
  public let kind: CircleKind
  public let radius: Double

  public init(kind: CircleKind, radius: Double) {
    self.kind = kind
    self.radius = radius
  }
}
