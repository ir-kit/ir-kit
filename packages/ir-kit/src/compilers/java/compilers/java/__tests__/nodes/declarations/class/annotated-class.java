// // User entity class
// // Represents a user in the system
@Entity
@Table(name = "users")
public class User {
  private Long id;

  public Long getId() {
    return this.id;
  }
}
