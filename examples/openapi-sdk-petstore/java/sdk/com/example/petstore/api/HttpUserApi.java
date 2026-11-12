package com.example.petstore.api;

import com.example.petstore.model.UpdateProfileBody;
import com.example.petstore.model.UpdateProfileResponse;
import com.example.petstore.model.User;
import com.example.petstore.runtime.ApiClient;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.RequestOptions;
import com.example.petstore.runtime.UrlEncoding;
import com.fasterxml.jackson.core.type.TypeReference;
import java.net.http.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class HttpUserApi implements UserApi {
  private final ApiClient client;

  public HttpUserApi(ApiClient client) {
    this.client = client;
  }

  @Override
  public User createUser(User body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public ApiResult<User> createUserWithResponse(User body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public User createUsersWithListInput(List<User> body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", "createWithList");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public ApiResult<User> createUsersWithListInputWithResponse(
      List<User> body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", "createWithList");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public String loginUser(String username, String password, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "username", username);
    UrlEncoding.addScalar(query, "password", password);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "user", "login"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<String>() {}, options);
  }

  @Override
  public ApiResult<String> loginUserWithResponse(
      String username, String password, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var query = new ArrayList<String>();
    UrlEncoding.addScalar(query, "username", username);
    UrlEncoding.addScalar(query, "password", password);
    var url = UrlEncoding.withQuery(UrlEncoding.path(baseUri, "user", "login"), query);
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<String>() {}, options);
  }

  @Override
  public void logoutUser(RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", "logout");
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> logoutUserWithResponse(RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", "logout");
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }

  @Override
  public User getUserByName(String username, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public ApiResult<User> getUserByNameWithResponse(String username, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<User>() {}, options);
  }

  @Override
  public void updateUser(String username, User body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("PUT", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> updateUserWithResponse(
      String username, User body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("PUT", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }

  @Override
  public void deleteUser(String username, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> deleteUserWithResponse(String username, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "user", String.valueOf(username));
    var builder = HttpRequest.newBuilder();
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }

  @Override
  public UpdateProfileResponse updateProfile(UpdateProfileBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "profile");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<UpdateProfileResponse>() {}, options);
  }

  @Override
  public ApiResult<UpdateProfileResponse> updateProfileWithResponse(
      UpdateProfileBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "profile");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(
        builder, new TypeReference<UpdateProfileResponse>() {}, options);
  }
}
