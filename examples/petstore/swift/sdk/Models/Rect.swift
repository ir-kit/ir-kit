import Foundation

public struct Rect: Codable {
  public let kind: RectKind
  public let width: Double
  public let height: Double

  public init(kind: RectKind, width: Double, height: Double) {
    self.kind = kind
    self.width = width
    self.height = height
  }
}
