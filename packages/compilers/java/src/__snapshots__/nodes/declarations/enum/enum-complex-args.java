public enum HttpStatus {
  OK("OK", 200), NOT_FOUND("Not Found", 404), INTERNAL_SERVER_ERROR("Internal Server Error", 500);
  private final String name;
  private final int value;
  private HttpStatus(String name, int value) {
    this.name = name;
    this.value = value;
  }
  public String getName() {
    return this.name;
  }
  public int getValue() {
    return this.value;
  }
}
