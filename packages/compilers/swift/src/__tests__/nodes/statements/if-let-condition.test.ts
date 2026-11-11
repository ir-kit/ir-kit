import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("optional binding condition", () => {
  it("an if-let unwrapping an optional", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [
          {
            firstName: "optional",
            type: swift.factory.createOptionalType(
              swift.factory.createIdentifierType("Int"),
            ),
          },
        ],
        undefined,
        [
          swift.factory.createIfStatement(
            [
              {
                bindingSpecifier: "let",
                initializer: swift.factory.createIdentifier("optional"),
                pattern: "value",
              },
            ],
            [
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier("print"),
                  [{ expression: swift.factory.createIdentifier("value") }],
                ),
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "if-let-condition.swift");
  });
});
