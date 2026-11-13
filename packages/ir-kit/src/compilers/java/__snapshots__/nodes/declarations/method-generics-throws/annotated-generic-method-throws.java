public class AnnotatedGenericUtil {
  @SuppressWarnings("unchecked")
  @SafeVarargs
  public static void safeVarargsMethod<T>(T[]... args) throws Exception {
    System.out.println("Processing varargs");
  }
}
