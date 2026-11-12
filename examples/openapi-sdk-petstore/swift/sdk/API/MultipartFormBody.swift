import Foundation

public final class MultipartFormBody {
  public let boundary: String
  public let contentType: String
  private var data: Data
  private var finalized: Bool = false

  public init(boundary: String = UUID().uuidString) {
    self.boundary = boundary
    self.contentType = "multipart/form-data; boundary=\(boundary)"
    self.data = Data()
  }

  public func append(_ value: String, name: String) {
    data.append(Data("--\(boundary)\r\n".utf8))
    data.append(Data("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".utf8))
    data.append(Data(value.utf8))
    data.append(Data("\r\n".utf8))
  }

  public func append(
    _ blob: Data,
    name: String,
    filename: String,
    mimeType: String = "application/octet-stream"
  ) {
    data.append(Data("--\(boundary)\r\n".utf8))
    data.append(Data(
      "Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\nContent-Type: \(mimeType)\r\n\r\n".utf8
    ))
    data.append(blob)
    data.append(Data("\r\n".utf8))
  }

  public func finalize() -> Data {
    if finalized {
      return data
    }
    finalized = true
    data.append(Data("--\(boundary)--\r\n".utf8))
    return data
  }
}
