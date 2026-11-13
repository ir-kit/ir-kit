public interface FileStream extends Readable, Writable, Closeable {
  public String read();

  public void write(String data);

  public void close();
}
