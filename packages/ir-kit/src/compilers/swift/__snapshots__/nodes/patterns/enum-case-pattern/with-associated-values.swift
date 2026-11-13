enum Status {
  case success
  case failure(Int)
}
func handle(_ value: Status) {
  switch value {
  case .failure(let code):
    return
  default:
    return
  }
}
