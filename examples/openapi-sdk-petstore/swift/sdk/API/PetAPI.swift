import Foundation

public protocol PetAPI {
  /// POST /pet
  func addPet(body: Pet, options: RequestOptions) async throws -> Pet

  /// POST /pet
  func addPetWithResponse(
    body: Pet,
    options: RequestOptions
  ) async throws -> (Pet, HTTPURLResponse)

  /// PUT /pet
  func updatePet(body: Pet, options: RequestOptions) async throws -> Pet

  /// PUT /pet
  func updatePetWithResponse(
    body: Pet,
    options: RequestOptions
  ) async throws -> (Pet, HTTPURLResponse)

  /// GET /pet/findByStatus
  func findPetsByStatus(
    status: FindPetsByStatusParamStatus,
    options: RequestOptions
  ) async throws -> [Pet]

  /// GET /pet/findByStatus
  func findPetsByStatusWithResponse(
    status: FindPetsByStatusParamStatus,
    options: RequestOptions
  ) async throws -> ([Pet], HTTPURLResponse)

  /// GET /pet/findByTags
  func findPetsByTags(tags: [String], options: RequestOptions) async throws -> [Pet]

  /// GET /pet/findByTags
  func findPetsByTagsWithResponse(
    tags: [String],
    options: RequestOptions
  ) async throws -> ([Pet], HTTPURLResponse)

  /// GET /pet/{petId}
  func getPetById(petId: Int64, options: RequestOptions) async throws -> Pet

  /// GET /pet/{petId}
  func getPetByIdWithResponse(
    petId: Int64,
    options: RequestOptions
  ) async throws -> (Pet, HTTPURLResponse)

  /// POST /pet/{petId}
  func updatePetWithForm(
    petId: Int64,
    name: String?,
    status: String?,
    options: RequestOptions
  ) async throws -> Pet

  /// POST /pet/{petId}
  func updatePetWithFormWithResponse(
    petId: Int64,
    name: String?,
    status: String?,
    options: RequestOptions
  ) async throws -> (Pet, HTTPURLResponse)

  /// DELETE /pet/{petId}
  func deletePet(petId: Int64, apiKey: String?, options: RequestOptions) async throws

  /// DELETE /pet/{petId}
  func deletePetWithResponse(
    petId: Int64,
    apiKey: String?,
    options: RequestOptions
  ) async throws -> HTTPURLResponse

  /// POST /pet/{petId}/uploadImage
  func uploadFile(
    petId: Int64,
    additionalMetadata: String?,
    body: Data,
    options: RequestOptions
  ) async throws -> ApiResponse

  /// POST /pet/{petId}/uploadImage
  func uploadFileWithResponse(
    petId: Int64,
    additionalMetadata: String?,
    body: Data,
    options: RequestOptions
  ) async throws -> (ApiResponse, HTTPURLResponse)

  /// POST /pet/{petId}/uploadDocument
  func uploadPetDocument(
    petId: Int64,
    file: Data,
    title: String?,
    description: String?,
    options: RequestOptions
  ) async throws -> ApiResponse

  /// POST /pet/{petId}/uploadDocument
  func uploadPetDocumentWithResponse(
    petId: Int64,
    file: Data,
    title: String?,
    description: String?,
    options: RequestOptions
  ) async throws -> (ApiResponse, HTTPURLResponse)

  /// POST /tags
  func submitTags(
    body: SubmitTagsBody,
    options: RequestOptions
  ) async throws -> SubmitTagsResponse

  /// POST /tags
  func submitTagsWithResponse(
    body: SubmitTagsBody,
    options: RequestOptions
  ) async throws -> (SubmitTagsResponse, HTTPURLResponse)
}
