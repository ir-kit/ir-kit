import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("await expression", () => {
  it("inside an async function", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [],
        undefined,
        [
          swift.factory.createVariableDeclaration("let", [
            {
              initializer: swift.factory.createAwaitExpression(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier("load"),
                  [],
                ),
              ),
              pattern: "value",
            },
          ]),
        ],
        undefined,
        undefined,
        { async: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "await-expression.swift");
  });
});
