public class Container<T extends Comparable, U extends Number> {
  private T value;

  public Container(T value) {
    this.value = value;
  }

  public T getValue() {
    return this.value;
  }
}
