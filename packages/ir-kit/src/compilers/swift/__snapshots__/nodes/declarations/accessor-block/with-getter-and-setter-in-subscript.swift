struct Store {
  subscript(key: String) -> Int {
    get {
      return 0
    }
    set {
      store()
    }
  }
}
