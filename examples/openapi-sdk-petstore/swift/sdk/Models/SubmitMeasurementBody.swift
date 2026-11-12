import Foundation

public struct SubmitMeasurementBody: Codable {
  public let value: Double

  public init(value: Double) {
    self.value = value
  }
}
