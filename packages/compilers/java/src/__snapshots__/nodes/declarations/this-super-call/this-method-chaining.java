public class Builder {
  private String value;
  public Builder() {
    this.value = "";
  }
  public Builder setValue(String value) {
    this.value = value;
    return this;
  }
}
