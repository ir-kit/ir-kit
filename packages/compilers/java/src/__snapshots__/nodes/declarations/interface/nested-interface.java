public interface OuterProcessor {
  public void process();

  public static interface InnerProcessor {
    public void processInner();
  }
}
