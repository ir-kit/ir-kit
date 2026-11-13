import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("integer literal expression", () => {
  it("bound to a constant", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createIntegerLiteral("42"),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "integer-literal.swift");
  });
});
