import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("ternary expression", () => {
  it("selects between two values", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createTernaryExpression(
            swift.factory.createIdentifier("flag"),
            swift.factory.createIntegerLiteral("1"),
            swift.factory.createIntegerLiteral("2"),
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "ternary-expression.swift");
  });
});
