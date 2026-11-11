public class RecursiveGenericUtil {
  public static T max<T extends Comparable.T>(T a, T b) throws NullPointerException {
    return a.compareTo(b) > 0 ? a : b;
  }
}
