public class Greeter {
  @Override
  public void greet(@NotNull @Size(min = 3, max = 10) String name) {
    @Author("me") String msg = "hi";
  }
}
