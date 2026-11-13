public class OuterClass {
  private String outerValue;

  public static class NestedClass {
    private int nestedValue;

    public int getNestedValue() {
      return this.nestedValue;
    }
  }

  public String getOuterValue() {
    return this.outerValue;
  }
}
