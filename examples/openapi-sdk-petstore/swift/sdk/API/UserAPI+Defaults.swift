import Foundation

extension UserAPI {
  /// POST /user
  public func createUser(body: User) async throws -> User {
    return try await self.createUser(body: body, options: RequestOptions())
  }

  /// POST /user
  public func createUserWithResponse(body: User) async throws -> (User, HTTPURLResponse) {
    return try await self.createUserWithResponse(body: body, options: RequestOptions())
  }

  /// POST /user/createWithList
  public func createUsersWithListInput(body: [User]) async throws -> User {
    return try await self.createUsersWithListInput(body: body, options: RequestOptions())
  }

  /// POST /user/createWithList
  public func createUsersWithListInputWithResponse(
    body: [User]
  ) async throws -> (User, HTTPURLResponse) {
    return try await self.createUsersWithListInputWithResponse(
      body: body, options: RequestOptions())
  }

  /// GET /user/login
  public func loginUser(username: String? = nil, password: String? = nil) async throws -> String {
    return try await self.loginUser(
      username: username, password: password, options: RequestOptions())
  }

  /// GET /user/login
  public func loginUserWithResponse(
    username: String? = nil,
    password: String? = nil
  ) async throws -> (String, HTTPURLResponse) {
    return try await self.loginUserWithResponse(
      username: username, password: password, options: RequestOptions())
  }

  /// GET /user/logout
  public func logoutUser() async throws {
    try await self.logoutUser(options: RequestOptions())
  }

  /// GET /user/logout
  public func logoutUserWithResponse() async throws -> HTTPURLResponse {
    return try await self.logoutUserWithResponse(options: RequestOptions())
  }

  /// GET /user/{username}
  public func getUserByName(username: String) async throws -> User {
    return try await self.getUserByName(username: username, options: RequestOptions())
  }

  /// GET /user/{username}
  public func getUserByNameWithResponse(username: String) async throws -> (User, HTTPURLResponse) {
    return try await self.getUserByNameWithResponse(username: username, options: RequestOptions())
  }

  /// PUT /user/{username}
  public func updateUser(username: String, body: User) async throws {
    try await self.updateUser(username: username, body: body, options: RequestOptions())
  }

  /// PUT /user/{username}
  public func updateUserWithResponse(username: String, body: User) async throws -> HTTPURLResponse {
    return try await self.updateUserWithResponse(
      username: username, body: body, options: RequestOptions())
  }

  /// DELETE /user/{username}
  public func deleteUser(username: String) async throws {
    try await self.deleteUser(username: username, options: RequestOptions())
  }

  /// DELETE /user/{username}
  public func deleteUserWithResponse(username: String) async throws -> HTTPURLResponse {
    return try await self.deleteUserWithResponse(username: username, options: RequestOptions())
  }

  /// POST /profile
  public func updateProfile(body: UpdateProfileBody) async throws -> UpdateProfileResponse {
    return try await self.updateProfile(body: body, options: RequestOptions())
  }

  /// POST /profile
  public func updateProfileWithResponse(
    body: UpdateProfileBody
  ) async throws -> (UpdateProfileResponse, HTTPURLResponse) {
    return try await self.updateProfileWithResponse(body: body, options: RequestOptions())
  }
}
