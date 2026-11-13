class Base {
  let value: Int = 0
}
class Derived: Base {
  func read() {
    let x = super.value
  }
}
