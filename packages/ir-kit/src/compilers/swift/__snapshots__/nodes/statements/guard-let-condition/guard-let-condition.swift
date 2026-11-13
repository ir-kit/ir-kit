func run(optional: Int?) {
  guard let value = optional else {
    return
  }
  print(value)
}
