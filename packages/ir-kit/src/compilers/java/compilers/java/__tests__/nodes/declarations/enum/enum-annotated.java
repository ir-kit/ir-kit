// // Legacy enum
// // Will be removed in future version
@Deprecated
@SuppressWarnings("unused")
public enum LegacyStatus {
  OLD(1),
  VERY_OLD(2);

  private final int code;

  private LegacyStatus(int code) {
    this.code = code;
  }
}
