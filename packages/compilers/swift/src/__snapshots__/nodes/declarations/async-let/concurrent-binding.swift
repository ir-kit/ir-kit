func fetch() -> Int {
  return 0
}
func run() async {
  async let value = fetch()
  print(await value)
}
