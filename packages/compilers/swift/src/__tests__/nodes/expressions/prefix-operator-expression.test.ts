import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("prefix operator expression", () => {
  it("negates an operand", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createPrefixOperatorExpression(
            "-",
            swift.factory.createIdentifier("value"),
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "prefix-operator-expression.swift",
    );
  });
});
