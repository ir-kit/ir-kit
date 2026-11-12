public class VarargsConstructor {
  private final String[] values;
  public VarargsConstructor(final String name, final String[]... values) {
    this.values = values;
  }
}
