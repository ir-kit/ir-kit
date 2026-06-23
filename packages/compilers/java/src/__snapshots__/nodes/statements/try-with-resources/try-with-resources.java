try (BufferedReader br = openReader()) {
  read();
} catch (IOException e) {
  handle(e);
} finally {
  cleanup();
}
