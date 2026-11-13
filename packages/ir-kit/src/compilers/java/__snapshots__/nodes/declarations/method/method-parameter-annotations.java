public class Validator {
  public boolean validate(
      @NotNull @Size(min = 1, max = 100) final String name, @NotNull final int age) {
    return name != null;
  }
}
