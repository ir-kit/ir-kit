struct Box {
  subscript<Element>(index: Int) -> Element {
    get {
      return storage
    }
  }
}
