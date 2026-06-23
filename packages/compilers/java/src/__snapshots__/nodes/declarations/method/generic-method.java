public class Utils {
  public static T max<T extends Comparable>(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
  }
}
