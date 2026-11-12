public class BoundedContainer<T extends Number, U extends Comparable & Serializable> {
  private T value;

  public T getValue() {
    return this.value;
  }
}
