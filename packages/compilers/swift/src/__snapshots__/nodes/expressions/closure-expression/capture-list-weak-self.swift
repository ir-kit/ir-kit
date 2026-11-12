class Worker {
  func run() {
  }
  func schedule() {
    let c = { [weak self] in
      self?.run()
    }
  }
}
