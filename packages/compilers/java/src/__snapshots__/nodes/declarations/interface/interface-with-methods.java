public interface DataRepository {
  public static final int MAX_CACHE_SIZE = 1000;

  public void save(Object entity);

  public Object findById(Long id);
}
