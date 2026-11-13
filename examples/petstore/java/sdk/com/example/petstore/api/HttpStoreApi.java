package com.example.petstore.api;

import com.example.petstore.model.CreateShapeResponse;
import com.example.petstore.model.Order;
import com.example.petstore.model.SubmitMeasurementBody;
import com.example.petstore.runtime.ApiClient;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.RequestOptions;
import com.example.petstore.runtime.UrlEncoding;
import com.fasterxml.jackson.core.type.TypeReference;
import java.net.http.HttpRequest;
import java.util.List;
import java.util.Map;

public class HttpStoreApi implements StoreApi {
  private final ApiClient client;

  public HttpStoreApi(ApiClient client) {
    this.client = client;
  }

  @Override
  public Map<String, Integer> getInventory(RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "inventory");
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("api_key")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Map<String, Integer>>() {}, options);
  }

  @Override
  public ApiResult<Map<String, Integer>> getInventoryWithResponse(RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "inventory");
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    for (var scheme : List.of("api_key")) {
      var auth = client.auth.get(scheme);
      if (auth != null) {
        url = auth.apply(builder, url);
      }
    }
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(
        builder, new TypeReference<Map<String, Integer>>() {}, options);
  }

  @Override
  public Order placeOrder(Order body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Order>() {}, options);
  }

  @Override
  public ApiResult<Order> placeOrderWithResponse(Order body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Order>() {}, options);
  }

  @Override
  public Order getOrderById(Long orderId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order", String.valueOf(orderId));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<Order>() {}, options);
  }

  @Override
  public ApiResult<Order> getOrderByIdWithResponse(Long orderId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order", String.valueOf(orderId));
    var builder = HttpRequest.newBuilder();
    builder.method("GET", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(builder, new TypeReference<Order>() {}, options);
  }

  @Override
  public void deleteOrder(Long orderId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order", String.valueOf(orderId));
    var builder = HttpRequest.newBuilder();
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> deleteOrderWithResponse(Long orderId, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "store", "order", String.valueOf(orderId));
    var builder = HttpRequest.newBuilder();
    builder.method("DELETE", HttpRequest.BodyPublishers.noBody());
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }

  @Override
  public CreateShapeResponse createShape(byte[] body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "shapes");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(body));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.execute(builder, new TypeReference<CreateShapeResponse>() {}, options);
  }

  @Override
  public ApiResult<CreateShapeResponse> createShapeWithResponse(
      byte[] body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "shapes");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(body));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeWithResponse(
        builder, new TypeReference<CreateShapeResponse>() {}, options);
  }

  @Override
  public void submitMeasurement(SubmitMeasurementBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "measurements");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    client.executeVoid(builder, options);
  }

  @Override
  public ApiResult<Void> submitMeasurementWithResponse(
      SubmitMeasurementBody body, RequestOptions options) {
    var client = options.client() != null ? options.client() : this.client;
    var baseUri = options.baseUri() != null ? options.baseUri() : client.baseUri;
    var url = UrlEncoding.path(baseUri, "measurements");
    var builder = HttpRequest.newBuilder();
    builder.header("Content-Type", "application/json");
    builder.method("POST", HttpRequest.BodyPublishers.ofByteArray(client.encode(body)));
    builder.uri(url);
    for (var header : options.headers().entrySet()) {
      builder.header(header.getKey(), header.getValue());
    }
    return client.executeVoidWithResponse(builder, options);
  }
}
