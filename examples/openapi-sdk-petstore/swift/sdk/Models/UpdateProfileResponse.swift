import Foundation

public struct UpdateProfileResponse: Codable {
  public let ok: Bool?

  public init(ok: Bool? = nil) {
    self.ok = ok
  }
}
