import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("is expression", () => {
  it("checks a type", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createIsExpression(
            swift.factory.createIdentifier("value"),
            swift.factory.createIdentifierType("String"),
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "is-expression.swift");
  });
});
