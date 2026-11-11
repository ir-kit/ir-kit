import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("infix operator expression", () => {
  it("adds two operands", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createInfixOperatorExpression(
            swift.factory.createIntegerLiteral("1"),
            "+",
            swift.factory.createIntegerLiteral("2"),
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "infix-operator-expression.swift");
  });
});
