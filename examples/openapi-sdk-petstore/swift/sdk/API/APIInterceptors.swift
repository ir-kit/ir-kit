import Foundation

#if canImport(FoundationNetworking)
  import FoundationNetworking
#endif
public final class APIInterceptors {
  public var request: [(URLRequest) async throws -> URLRequest] = []

  public init() {
  }
}
