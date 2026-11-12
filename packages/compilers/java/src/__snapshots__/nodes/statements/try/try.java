try {
  doWork();
} catch (Exception e) {
  handle(e);
} finally {
  cleanup();
}
