package com.example.petstore.runtime;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.UnaryOperator;

public record RequestOptions(
    ApiClient client,
    URI baseUri,
    Duration timeout,
    Map<String, String> headers,
    List<UnaryOperator<HttpRequest.Builder>> requestInterceptors,
    BiConsumer<byte[], HttpResponse<byte[]>> responseValidator,
    UnaryOperator<byte[]> responseTransformer) {

  public static RequestOptions defaults() {
    return new RequestOptions(null, null, null, Map.of(), List.of(), null, null);
  }

  public RequestOptions withClient(ApiClient client) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withBaseUri(URI baseUri) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withTimeout(Duration timeout) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withHeader(String name, String value) {
    Map<String, String> next = new LinkedHashMap<>(headers);
    next.put(name, value);
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        next,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withRequestInterceptors(
      List<UnaryOperator<HttpRequest.Builder>> requestInterceptors) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withResponseValidator(
      BiConsumer<byte[], HttpResponse<byte[]>> responseValidator) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }

  public RequestOptions withResponseTransformer(UnaryOperator<byte[]> responseTransformer) {
    return new RequestOptions(
        client,
        baseUri,
        timeout,
        headers,
        requestInterceptors,
        responseValidator,
        responseTransformer);
  }
}
