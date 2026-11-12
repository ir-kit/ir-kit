package com.example.petstore.runtime;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.UnaryOperator;

public final class ApiClient {
  public URI baseUri;
  public final HttpClient httpClient;
  public final ObjectMapper mapper;
  public final ApiInterceptors interceptors = new ApiInterceptors();
  public final Map<String, Auth> auth = new LinkedHashMap<>();

  public ApiClient(URI baseUri) {
    this(baseUri, HttpClient.newHttpClient(), defaultMapper());
  }

  public ApiClient(URI baseUri, HttpClient httpClient, ObjectMapper mapper) {
    this.baseUri = baseUri;
    this.httpClient = httpClient;
    this.mapper = mapper;
  }

  public static ObjectMapper defaultMapper() {
    return new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  }

  public byte[] encode(Object value) {
    try {
      return mapper.writeValueAsBytes(value);
    } catch (IOException e) {
      throw new IllegalArgumentException("Encoding failed", e);
    }
  }

  public <T> T decode(byte[] body, TypeReference<T> type) {
    try {
      return mapper.readValue(body, type);
    } catch (IOException e) {
      throw ApiException.decoding(e);
    }
  }

  public <T> T execute(HttpRequest.Builder request, TypeReference<T> type, RequestOptions options) {
    return executeWithResponse(request, type, options).body();
  }

  public <T> ApiResult<T> executeWithResponse(
      HttpRequest.Builder request, TypeReference<T> type, RequestOptions options) {
    ApiResult<byte[]> raw = executeRaw(request, options);
    return new ApiResult<>(decode(raw.body(), type), raw.response());
  }

  public void executeVoid(HttpRequest.Builder request, RequestOptions options) {
    executeVoidWithResponse(request, options);
  }

  public ApiResult<Void> executeVoidWithResponse(
      HttpRequest.Builder request, RequestOptions options) {
    HttpResponse<byte[]> response = send(request, options);
    return new ApiResult<>(null, response);
  }

  public ApiResult<byte[]> executeRaw(HttpRequest.Builder request, RequestOptions options) {
    HttpResponse<byte[]> response = send(request, options);
    byte[] body = response.body();
    if (options.responseTransformer() != null) body = options.responseTransformer().apply(body);
    return new ApiResult<>(body, response);
  }

  private HttpResponse<byte[]> send(HttpRequest.Builder request, RequestOptions options) {
    HttpRequest.Builder builder = request;
    for (UnaryOperator<HttpRequest.Builder> interceptor : interceptors.request) {
      builder = interceptor.apply(builder);
    }
    for (UnaryOperator<HttpRequest.Builder> interceptor : options.requestInterceptors()) {
      builder = interceptor.apply(builder);
    }
    if (options.timeout() != null) builder.timeout(options.timeout());
    HttpResponse<byte[]> response;
    try {
      response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());
    } catch (IOException e) {
      throw ApiException.transport(e);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw ApiException.transport(e);
    }
    int status = response.statusCode();
    if (status < 200 || status >= 300) throw ApiException.forStatus(status, response.body());
    if (options.responseValidator() != null) {
      options.responseValidator().accept(response.body(), response);
    }
    return response;
  }
}
