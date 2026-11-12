package dev.irkit.runtime;

import java.net.URI;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public sealed interface Auth permits Auth.Bearer, Auth.ApiKey, Auth.Basic {
  /** Applies the credential to the request; returns the (possibly rewritten) URI. */
  URI apply(HttpRequest.Builder builder, URI uri);

  record Bearer(String token) implements Auth {
    @Override
    public URI apply(HttpRequest.Builder builder, URI uri) {
      builder.setHeader("Authorization", "Bearer " + token);
      return uri;
    }
  }

  record ApiKey(String name, String value, ApiKeyLocation location) implements Auth {
    @Override
    public URI apply(HttpRequest.Builder builder, URI uri) {
      switch (location) {
        case HEADER -> builder.setHeader(name, value);
        case QUERY -> {
          return UrlEncoding.appendQuery(
              uri, UrlEncoding.encode(name) + "=" + UrlEncoding.encode(value));
        }
        case COOKIE -> builder.header("Cookie", name + "=" + value);
      }
      return uri;
    }
  }

  record Basic(String username, String password) implements Auth {
    @Override
    public URI apply(HttpRequest.Builder builder, URI uri) {
      String encoded =
          Base64.getEncoder()
              .encodeToString((username + ":" + password).getBytes(StandardCharsets.UTF_8));
      builder.setHeader("Authorization", "Basic " + encoded);
      return uri;
    }
  }
}
