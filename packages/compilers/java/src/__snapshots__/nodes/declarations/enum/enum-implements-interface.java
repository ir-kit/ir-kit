public enum Status implements Describable {
  PENDING("Task is pending"), IN_PROGRESS("Task is in progress"), COMPLETED("Task is completed");
  private final String description;
  private Status(String description) {
    this.description = description;
  }
  public String getDescription() {
    return this.description;
  }
}
