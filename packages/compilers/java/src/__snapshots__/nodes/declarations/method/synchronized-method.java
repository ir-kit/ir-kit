public class Counter {
  private int count = 0;

  public synchronized void increment() {
    this.count = this.count + 1;
  }
}
