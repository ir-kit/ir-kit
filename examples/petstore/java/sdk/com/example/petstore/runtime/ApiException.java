package com.example.petstore.runtime;

public class ApiException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  private final int statusCode;
  private final byte[] body;

  public ApiException(String message, int statusCode, byte[] body, Throwable cause) {
    super(message, cause);
    this.statusCode = statusCode;
    this.body = body;
  }

  /** HTTP status, or 0 for transport and decoding failures. */
  public int statusCode() {
    return statusCode;
  }

  public byte[] body() {
    return body;
  }

  public static ApiException forStatus(int statusCode, byte[] body) {
    String kind =
        statusCode >= 400 && statusCode < 500
            ? "Client error"
            : statusCode >= 500 && statusCode < 600 ? "Server error" : "Unexpected status";
    return new ApiException(kind + ": " + statusCode, statusCode, body, null);
  }

  public static ApiException transport(Throwable cause) {
    return new ApiException("Transport failure: " + cause.getMessage(), 0, new byte[0], cause);
  }

  public static ApiException decoding(Throwable cause) {
    return new ApiException("Decoding failed: " + cause.getMessage(), 0, new byte[0], cause);
  }
}
