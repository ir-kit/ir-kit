String s =
    switch (x) {
  case 1, 2 -> "one-two";
  default -> {
    log("other");
    yield "rest";
  }
};
