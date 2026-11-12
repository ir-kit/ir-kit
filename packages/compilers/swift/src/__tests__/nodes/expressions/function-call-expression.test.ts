import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("function call expression", () => {
  it("with labeled and unlabeled arguments", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createFunctionCallExpression(
            swift.factory.createIdentifier("greet"),
            [
              { expression: swift.factory.createStringLiteral("world") },
              {
                expression: swift.factory.createIntegerLiteral("2"),
                label: "times",
              },
            ],
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "function-call-expression.swift");
  });
});
