import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("postfix operator expression", () => {
  it("force-unwraps an operand", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createPostfixOperatorExpression(
            swift.factory.createIdentifier("value"),
            "!",
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "postfix-operator-expression.swift",
    );
  });
});
