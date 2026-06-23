public enum GenericEnum {
  FIRST("first"), SECOND("second");
  private final T value;
  private GenericEnum(T value) {
    this.value = value;
  }
  public T getValue() {
    return this.value;
  }
}
