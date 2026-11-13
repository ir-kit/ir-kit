public enum Priority {
  LOW(1),
  MEDIUM(2),
  HIGH(3);

  private final int level;

  private Priority(int level) {
    this.level = level;
  }

  public int getLevel() {
    return this.level;
  }
}
