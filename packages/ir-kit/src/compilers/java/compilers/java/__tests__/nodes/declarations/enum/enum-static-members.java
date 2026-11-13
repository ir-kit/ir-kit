public enum State {
  INITIAL,
  PROCESSING,
  COMPLETED;

  public static final int DEFAULT_COUNT = 0;

  public static int getDefaultCount() {
    return DEFAULT_COUNT;
  }

  public boolean isDefault() {
    return this.ordinal() == DEFAULT_COUNT;
  }
}
