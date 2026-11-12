public interface FileProcessor {
  public String process(String content);

  public default String processWithValidation(String content) {
    return this.process(content);
  }

  public static FileProcessor getDefaultProcessor() {
    return "DefaultProcessor";
  }
}
