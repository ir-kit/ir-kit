import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("array literal expression", () => {
  it("bound to a constant", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createArrayLiteral([
            swift.factory.createIntegerLiteral("1"),
            swift.factory.createIntegerLiteral("2"),
            swift.factory.createIntegerLiteral("3"),
          ]),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "array-literal.swift");
  });
});
