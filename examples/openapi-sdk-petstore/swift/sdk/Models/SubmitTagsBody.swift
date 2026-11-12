import Foundation

public struct SubmitTagsBody: Codable {
  public let tags: [String]

  public init(tags: [String]) {
    self.tags = tags
  }
}
