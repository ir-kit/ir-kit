public interface GenericComparator<T extends Comparable, U extends Number> {
  public int compare(T first, T second);

  public double calculate(U value);
}
