public interface MultiBoundedComparator<T extends Comparable & Serializable> {
  public int compare(T a, T b);
}
