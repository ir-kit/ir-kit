import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("subscript expression", () => {
  it("indexes into an identifier", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createSubscriptExpression(
            swift.factory.createIdentifier("items"),
            [swift.factory.createIntegerLiteral("0")],
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "subscript-expression.swift");
  });
});
