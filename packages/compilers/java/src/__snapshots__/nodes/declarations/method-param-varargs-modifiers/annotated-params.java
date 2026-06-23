public class Validator {
  public boolean validateAndProcess(@NotNull @Size(min = 1, max = 100) final String name, @NotNull final Integer[]... values) {
    return true;
  }
}
