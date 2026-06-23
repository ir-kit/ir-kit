public class Person {
  private String name;
  private int age;
  private boolean active;
  public Person(String name) {
    this(name, 0, true);
  }
  public Person(String name, int age, boolean active) {
    this.name = name;
    this.age = age;
    this.active = active;
  }
}
