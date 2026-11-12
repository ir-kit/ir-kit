package dev.irkit.runtime;

import java.io.ByteArrayOutputStream;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public final class MultipartFormBody {
  private final String boundary = "irkit-" + UUID.randomUUID();
  private final ByteArrayOutputStream data = new ByteArrayOutputStream();

  public String contentType() {
    return "multipart/form-data; boundary=" + boundary;
  }

  public void appendText(String name, String value) {
    write("--" + boundary + "\r\n");
    write("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
    write(value + "\r\n");
  }

  public void appendFile(String name, String filename, byte[] bytes, String mimeType) {
    write("--" + boundary + "\r\n");
    write(
        "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n");
    write("Content-Type: " + mimeType + "\r\n\r\n");
    data.writeBytes(bytes);
    write("\r\n");
  }

  public HttpRequest.BodyPublisher build() {
    write("--" + boundary + "--\r\n");
    return HttpRequest.BodyPublishers.ofByteArray(data.toByteArray());
  }

  private void write(String text) {
    data.writeBytes(text.getBytes(StandardCharsets.UTF_8));
  }
}
