import Foundation

public struct SubmitTagsResponse: Codable {
  public let count: Int32?

  public init(count: Int32? = nil) {
    self.count = count
  }
}
