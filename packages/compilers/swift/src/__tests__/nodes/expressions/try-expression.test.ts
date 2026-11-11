import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("try expression", () => {
  it("inside a throwing function", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [],
        undefined,
        [
          swift.factory.createVariableDeclaration("let", [
            {
              initializer: swift.factory.createTryExpression(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier("parse"),
                  [],
                ),
              ),
              pattern: "value",
            },
          ]),
        ],
        undefined,
        undefined,
        { throws: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "try-expression.swift");
  });
});
