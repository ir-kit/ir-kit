package com.example.petstore.runtime;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

public final class UrlEncoding {
  private UrlEncoding() {}

  /** Percent-encodes one path segment or query component (spaces as %20). */
  public static String encode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
  }

  /** Appends each segment as its own percent-encoded path component. */
  public static URI path(URI base, String... segments) {
    StringBuilder path = new StringBuilder(base.toString().replaceAll("/+$", ""));
    for (String segment : segments) path.append('/').append(encode(segment));
    return URI.create(path.toString());
  }

  public static void addScalar(List<String> query, String name, Object value) {
    if (value == null) return;
    query.add(encode(name) + "=" + encode(String.valueOf(value)));
  }

  public static void addArray(
      List<String> query, String name, List<?> values, QueryStyle style, boolean explode) {
    if (values == null) return;
    if (explode) {
      for (Object value : values) addScalar(query, name, value);
      return;
    }
    String separator =
        switch (style) {
          case FORM -> ",";
          case SPACE_DELIMITED -> " ";
          case PIPE_DELIMITED -> "|";
        };
    addScalar(
        query, name, values.stream().map(String::valueOf).collect(Collectors.joining(separator)));
  }

  public static URI withQuery(URI uri, List<String> query) {
    return query.isEmpty() ? uri : appendQuery(uri, String.join("&", query));
  }

  static URI appendQuery(URI uri, String pair) {
    String text = uri.toString();
    return URI.create(text + (uri.getRawQuery() == null ? "?" : "&") + pair);
  }
}
