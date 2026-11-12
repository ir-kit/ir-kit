package com.example.petstore.api;

import com.example.petstore.model.ApiResponse;
import com.example.petstore.model.FindPetsByStatusParamStatus;
import com.example.petstore.model.Pet;
import com.example.petstore.model.SubmitTagsBody;
import com.example.petstore.model.SubmitTagsResponse;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.RequestOptions;
import java.util.List;

public interface PetApi {
  // POST /pet
  Pet addPet(Pet body, RequestOptions options);

  default Pet addPet(Pet body) {
    return this.addPet(body, RequestOptions.defaults());
  }

  // POST /pet
  ApiResult<Pet> addPetWithResponse(Pet body, RequestOptions options);

  default ApiResult<Pet> addPetWithResponse(Pet body) {
    return this.addPetWithResponse(body, RequestOptions.defaults());
  }

  // PUT /pet
  Pet updatePet(Pet body, RequestOptions options);

  default Pet updatePet(Pet body) {
    return this.updatePet(body, RequestOptions.defaults());
  }

  // PUT /pet
  ApiResult<Pet> updatePetWithResponse(Pet body, RequestOptions options);

  default ApiResult<Pet> updatePetWithResponse(Pet body) {
    return this.updatePetWithResponse(body, RequestOptions.defaults());
  }

  // GET /pet/findByStatus
  List<Pet> findPetsByStatus(FindPetsByStatusParamStatus status, RequestOptions options);

  default List<Pet> findPetsByStatus(FindPetsByStatusParamStatus status) {
    return this.findPetsByStatus(status, RequestOptions.defaults());
  }

  // GET /pet/findByStatus
  ApiResult<List<Pet>> findPetsByStatusWithResponse(
      FindPetsByStatusParamStatus status, RequestOptions options);

  default ApiResult<List<Pet>> findPetsByStatusWithResponse(FindPetsByStatusParamStatus status) {
    return this.findPetsByStatusWithResponse(status, RequestOptions.defaults());
  }

  // GET /pet/findByTags
  List<Pet> findPetsByTags(List<String> tags, RequestOptions options);

  default List<Pet> findPetsByTags(List<String> tags) {
    return this.findPetsByTags(tags, RequestOptions.defaults());
  }

  // GET /pet/findByTags
  ApiResult<List<Pet>> findPetsByTagsWithResponse(List<String> tags, RequestOptions options);

  default ApiResult<List<Pet>> findPetsByTagsWithResponse(List<String> tags) {
    return this.findPetsByTagsWithResponse(tags, RequestOptions.defaults());
  }

  // GET /pet/{petId}
  Pet getPetById(Long petId, RequestOptions options);

  default Pet getPetById(Long petId) {
    return this.getPetById(petId, RequestOptions.defaults());
  }

  // GET /pet/{petId}
  ApiResult<Pet> getPetByIdWithResponse(Long petId, RequestOptions options);

  default ApiResult<Pet> getPetByIdWithResponse(Long petId) {
    return this.getPetByIdWithResponse(petId, RequestOptions.defaults());
  }

  // POST /pet/{petId}
  Pet updatePetWithForm(Long petId, String name, String status, RequestOptions options);

  default Pet updatePetWithForm(Long petId, String name, String status) {
    return this.updatePetWithForm(petId, name, status, RequestOptions.defaults());
  }

  // POST /pet/{petId}
  ApiResult<Pet> updatePetWithFormWithResponse(
      Long petId, String name, String status, RequestOptions options);

  default ApiResult<Pet> updatePetWithFormWithResponse(Long petId, String name, String status) {
    return this.updatePetWithFormWithResponse(petId, name, status, RequestOptions.defaults());
  }

  // DELETE /pet/{petId}
  void deletePet(Long petId, String apiKey, RequestOptions options);

  default void deletePet(Long petId, String apiKey) {
    this.deletePet(petId, apiKey, RequestOptions.defaults());
  }

  // DELETE /pet/{petId}
  ApiResult<Void> deletePetWithResponse(Long petId, String apiKey, RequestOptions options);

  default ApiResult<Void> deletePetWithResponse(Long petId, String apiKey) {
    return this.deletePetWithResponse(petId, apiKey, RequestOptions.defaults());
  }

  // POST /pet/{petId}/uploadImage
  ApiResponse uploadFile(
      Long petId, String additionalMetadata, byte[] body, RequestOptions options);

  default ApiResponse uploadFile(Long petId, String additionalMetadata, byte[] body) {
    return this.uploadFile(petId, additionalMetadata, body, RequestOptions.defaults());
  }

  // POST /pet/{petId}/uploadImage
  ApiResult<ApiResponse> uploadFileWithResponse(
      Long petId, String additionalMetadata, byte[] body, RequestOptions options);

  default ApiResult<ApiResponse> uploadFileWithResponse(
      Long petId, String additionalMetadata, byte[] body) {
    return this.uploadFileWithResponse(petId, additionalMetadata, body, RequestOptions.defaults());
  }

  // POST /pet/{petId}/uploadDocument
  ApiResponse uploadPetDocument(
      Long petId, byte[] file, String title, String description, RequestOptions options);

  default ApiResponse uploadPetDocument(Long petId, byte[] file, String title, String description) {
    return this.uploadPetDocument(petId, file, title, description, RequestOptions.defaults());
  }

  // POST /pet/{petId}/uploadDocument
  ApiResult<ApiResponse> uploadPetDocumentWithResponse(
      Long petId, byte[] file, String title, String description, RequestOptions options);

  default ApiResult<ApiResponse> uploadPetDocumentWithResponse(
      Long petId, byte[] file, String title, String description) {
    return this.uploadPetDocumentWithResponse(
        petId, file, title, description, RequestOptions.defaults());
  }

  // POST /tags
  SubmitTagsResponse submitTags(SubmitTagsBody body, RequestOptions options);

  default SubmitTagsResponse submitTags(SubmitTagsBody body) {
    return this.submitTags(body, RequestOptions.defaults());
  }

  // POST /tags
  ApiResult<SubmitTagsResponse> submitTagsWithResponse(SubmitTagsBody body, RequestOptions options);

  default ApiResult<SubmitTagsResponse> submitTagsWithResponse(SubmitTagsBody body) {
    return this.submitTagsWithResponse(body, RequestOptions.defaults());
  }
}
