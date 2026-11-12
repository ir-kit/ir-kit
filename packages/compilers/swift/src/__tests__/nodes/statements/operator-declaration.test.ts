import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("operator declaration", () => {
  it("prefix", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createOperatorDeclaration("prefix", "±"),
    ]);
    await assertPrintedMatchesSnapshot(file, "prefix.swift");
  });

  it("infix with precedence group", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createOperatorDeclaration(
        "infix",
        "+++",
        "AdditionPrecedence",
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "infix-with-precedence-group.swift",
    );
  });
});
