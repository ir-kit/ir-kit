public record Pet(long id, @JsonProperty("pet_name") String name) {
  public String label() {
    return name;
  }
}
