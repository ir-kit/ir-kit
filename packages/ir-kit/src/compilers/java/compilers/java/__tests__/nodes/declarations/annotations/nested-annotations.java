public class NestedAnnotationClass {
  @Outer(nested = Nested(value = "nested value"), count = 42)
  public void nestedAnnotationMethod();
}
