import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("expression statement", () => {
  it("a function call used as a statement", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createExpressionStatement(
          swift.factory.createFunctionCallExpression(
            swift.factory.createIdentifier("print"),
            [{ expression: swift.factory.createStringLiteral("hello") }],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "expression.swift");
  });
});
