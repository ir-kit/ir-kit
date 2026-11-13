import Foundation

#if canImport(FoundationNetworking)
  import FoundationNetworking
#endif
extension PetAPI {
  /// POST /pet
  public func addPet(body: Pet) async throws -> Pet {
    return try await self.addPet(body: body, options: RequestOptions())
  }

  /// POST /pet
  public func addPetWithResponse(body: Pet) async throws -> (Pet, HTTPURLResponse) {
    return try await self.addPetWithResponse(body: body, options: RequestOptions())
  }

  /// PUT /pet
  public func updatePet(body: Pet) async throws -> Pet {
    return try await self.updatePet(body: body, options: RequestOptions())
  }

  /// PUT /pet
  public func updatePetWithResponse(body: Pet) async throws -> (Pet, HTTPURLResponse) {
    return try await self.updatePetWithResponse(body: body, options: RequestOptions())
  }

  /// GET /pet/findByStatus
  public func findPetsByStatus(status: FindPetsByStatusParamStatus) async throws -> [Pet] {
    return try await self.findPetsByStatus(status: status, options: RequestOptions())
  }

  /// GET /pet/findByStatus
  public func findPetsByStatusWithResponse(
    status: FindPetsByStatusParamStatus
  ) async throws -> ([Pet], HTTPURLResponse) {
    return try await self.findPetsByStatusWithResponse(status: status, options: RequestOptions())
  }

  /// GET /pet/findByTags
  public func findPetsByTags(tags: [String]) async throws -> [Pet] {
    return try await self.findPetsByTags(tags: tags, options: RequestOptions())
  }

  /// GET /pet/findByTags
  public func findPetsByTagsWithResponse(tags: [String]) async throws -> ([Pet], HTTPURLResponse) {
    return try await self.findPetsByTagsWithResponse(tags: tags, options: RequestOptions())
  }

  /// GET /pet/{petId}
  public func getPetById(petId: Int64) async throws -> Pet {
    return try await self.getPetById(petId: petId, options: RequestOptions())
  }

  /// GET /pet/{petId}
  public func getPetByIdWithResponse(petId: Int64) async throws -> (Pet, HTTPURLResponse) {
    return try await self.getPetByIdWithResponse(petId: petId, options: RequestOptions())
  }

  /// POST /pet/{petId}
  public func updatePetWithForm(
    petId: Int64,
    name: String? = nil,
    status: String? = nil
  ) async throws -> Pet {
    return try await self.updatePetWithForm(
      petId: petId, name: name, status: status, options: RequestOptions())
  }

  /// POST /pet/{petId}
  public func updatePetWithFormWithResponse(
    petId: Int64,
    name: String? = nil,
    status: String? = nil
  ) async throws -> (Pet, HTTPURLResponse) {
    return try await self.updatePetWithFormWithResponse(
      petId: petId, name: name, status: status, options: RequestOptions())
  }

  /// DELETE /pet/{petId}
  public func deletePet(petId: Int64, apiKey: String? = nil) async throws {
    try await self.deletePet(petId: petId, apiKey: apiKey, options: RequestOptions())
  }

  /// DELETE /pet/{petId}
  public func deletePetWithResponse(
    petId: Int64,
    apiKey: String? = nil
  ) async throws -> HTTPURLResponse {
    return try await self.deletePetWithResponse(
      petId: petId, apiKey: apiKey, options: RequestOptions())
  }

  /// POST /pet/{petId}/uploadImage
  public func uploadFile(
    petId: Int64,
    additionalMetadata: String? = nil,
    body: Data
  ) async throws -> ApiResponse {
    return try await self.uploadFile(
      petId: petId, additionalMetadata: additionalMetadata, body: body, options: RequestOptions())
  }

  /// POST /pet/{petId}/uploadImage
  public func uploadFileWithResponse(
    petId: Int64,
    additionalMetadata: String? = nil,
    body: Data
  ) async throws -> (ApiResponse, HTTPURLResponse) {
    return try await self.uploadFileWithResponse(
      petId: petId, additionalMetadata: additionalMetadata, body: body, options: RequestOptions())
  }

  /// POST /pet/{petId}/uploadDocument
  public func uploadPetDocument(
    petId: Int64,
    file: Data,
    title: String? = nil,
    description: String? = nil
  ) async throws -> ApiResponse {
    return try await self.uploadPetDocument(
      petId: petId, file: file, title: title, description: description, options: RequestOptions())
  }

  /// POST /pet/{petId}/uploadDocument
  public func uploadPetDocumentWithResponse(
    petId: Int64,
    file: Data,
    title: String? = nil,
    description: String? = nil
  ) async throws -> (ApiResponse, HTTPURLResponse) {
    return try await self.uploadPetDocumentWithResponse(
      petId: petId, file: file, title: title, description: description, options: RequestOptions())
  }

  /// POST /tags
  public func submitTags(body: SubmitTagsBody) async throws -> SubmitTagsResponse {
    return try await self.submitTags(body: body, options: RequestOptions())
  }

  /// POST /tags
  public func submitTagsWithResponse(
    body: SubmitTagsBody
  ) async throws -> (SubmitTagsResponse, HTTPURLResponse) {
    return try await self.submitTagsWithResponse(body: body, options: RequestOptions())
  }
}
