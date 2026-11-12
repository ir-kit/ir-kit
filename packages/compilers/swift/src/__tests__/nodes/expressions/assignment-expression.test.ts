import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("assignment expression", () => {
  it("assigns to a mutable variable", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createVariableDeclaration("var", [
          {
            initializer: swift.factory.createIntegerLiteral("0"),
            pattern: "count",
          },
        ]),
        swift.factory.createExpressionStatement(
          swift.factory.createAssignmentExpression(
            swift.factory.createIdentifier("count"),
            swift.factory.createIntegerLiteral("1"),
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "assignment-expression.swift");
  });
});
