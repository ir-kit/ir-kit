public class GenericUtil {
  public static U compareAndConvert<T extends Comparable, U extends Number>(T first, T second, U converter) throws IllegalArgumentException, ArithmeticException {
    return first.compareTo(second) > 0 ? converter : 0;
  }
}
