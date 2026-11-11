public class Student extends Person implements Serializable {
  private String name;
  public Student(String name) {
    this.name = name;
  }
  public String getName() {
    return this.name;
  }
}
