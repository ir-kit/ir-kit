public class SafeVarargsUtil {
  @SafeVarargs
  @SuppressWarnings("unchecked")
  public static void safeVarargsMethod(final Object[]... items) {
    System.out.println("Safe varargs processing");
  }
}
