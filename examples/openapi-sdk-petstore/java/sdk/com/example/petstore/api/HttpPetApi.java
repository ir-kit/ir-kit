package com.example.petstore.api;

import com.example.petstore.model.ApiResponse;
import com.example.petstore.model.FindPetsByStatusParamStatus;
import com.example.petstore.model.Pet;
import com.example.petstore.model.SubmitTagsBody;
import com.example.petstore.model.SubmitTagsResponse;
import com.example.petstore.runtime.ApiClient;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.MultipartFormBody;
import com.example.petstore.runtime.QueryStyle;
import com.example.petstore.runtime.RequestOptions;
import com.example.petstore.runtime.UrlEncoding;
import com.fasterxml.jackson.core.type.TypeReference;
import java.net.http.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class HttpPetApi implements PetApi {
  private final ApiClient client;

  public HttpPetApi(ApiClient client) {
    this.client = client;
  }

  @Override
  public Pet addPet(Pet body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public ApiResult<Pet> addPetWithResponse(Pet body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public Pet updatePet(Pet body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("PUT", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public ApiResult<Pet> updatePetWithResponse(Pet body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("PUT", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public List<Pet> findPetsByStatus(FindPetsByStatusParamStatus status, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "status", status);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", "findByStatus"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<List<Pet>>() {}, options);
  }

  @Override
  public ApiResult<List<Pet>> findPetsByStatusWithResponse(
      FindPetsByStatusParamStatus status, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "status", status);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", "findByStatus"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<List<Pet>>() {}, options);
  }

  @Override
  public List<Pet> findPetsByTags(List<String> tags, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addArray(query, "tags", tags, QueryStyle.FORM, true);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", "findByTags"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<List<Pet>>() {}, options);
  }

  @Override
  public ApiResult<List<Pet>> findPetsByTagsWithResponse(
      List<String> tags, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addArray(query, "tags", tags, QueryStyle.FORM, true);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", "findByTags"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<List<Pet>>() {}, options);
  }

  @Override
  public Pet getPetById(Long petId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("api_key", "petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public ApiResult<Pet> getPetByIdWithResponse(Long petId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("api_key", "petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public Pet updatePetWithForm(Long petId, String name, String status, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "name", name);
    UrlEncoding.addScalar(query, "status", status);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", String.valueOf(petId)), query);
    var builder = HttpRequest.newBuilder();
    builder.method("POST", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public ApiResult<Pet> updatePetWithFormWithResponse(
      Long petId, String name, String status, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "name", name);
    UrlEncoding.addScalar(query, "status", status);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "pet", String.valueOf(petId)), query);
    var builder = HttpRequest.newBuilder();
    builder.method("POST", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Pet>() {}, options);
  }

  @Override
  public void deletePet(Long petId, String apiKey, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId));
    var builder = HttpRequest.newBuilder();
    if (apiKey != null) {
      builder.header("api_key", String.valueOf(apiKey));
    }
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> deletePetWithResponse(Long petId, String apiKey, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId));
    var builder = HttpRequest.newBuilder();
    if (apiKey != null) {
      builder.header("api_key", String.valueOf(apiKey));
    }
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }

  @Override
  public ApiResponse uploadFile(
      Long petId, String additionalMetadata, byte[] body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "additionalMetadata", additionalMetadata);
    var url =
        UrlEncoding.withQuery(
            UrlEncoding.path(baseUri, "pet", String.valueOf(petId), "uploadImage"), query);
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/octet-stream");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(body));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<ApiResponse>() {}, options);
  }

  @Override
  public ApiResult<ApiResponse> uploadFileWithResponse(
      Long petId, String additionalMetadata, byte[] body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "additionalMetadata", additionalMetadata);
    var url =
        UrlEncoding.withQuery(
            UrlEncoding.path(baseUri, "pet", String.valueOf(petId), "uploadImage"), query);
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/octet-stream");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(body));
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<ApiResponse>() {}, options);
  }

  @Override
  public ApiResponse uploadPetDocument(
      Long petId, byte[] file, String title, String description, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId), "uploadDocument");
    var builder = HttpRequest.newBuilder();
    var form = new MultipartFormBody();
    if (file != null) {
      form.appendFile("file", "file", file, "application/octet-stream");
    }
    if (title != null) {
      form.appendText("title", String.valueOf(title));
    }
    if (description != null) {
      form.appendText("description", String.valueOf(description));
    }
    builder.header("Content-Type", form.contentType());
    builder.method("POST", form.build());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<ApiResponse>() {}, options);
  }

  @Override
  public ApiResult<ApiResponse> uploadPetDocumentWithResponse(
      Long petId, byte[] file, String title, String description, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "pet", String.valueOf(petId), "uploadDocument");
    var builder = HttpRequest.newBuilder();
    var form = new MultipartFormBody();
    if (file != null) {
      form.appendFile("file", "file", file, "application/octet-stream");
    }
    if (title != null) {
      form.appendText("title", String.valueOf(title));
    }
    if (description != null) {
      form.appendText("description", String.valueOf(description));
    }
    builder.header("Content-Type", form.contentType());
    builder.method("POST", form.build());
    for (var scheme : List.of("petstore_auth")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<ApiResponse>() {}, options);
  }

  @Override
  public SubmitTagsResponse submitTags(SubmitTagsBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "tags");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<SubmitTagsResponse>() {}, options);
  }

  @Override
  public ApiResult<SubmitTagsResponse> submitTagsWithResponse(
      SubmitTagsBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "tags");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<SubmitTagsResponse>() {}, options);
  }
}
