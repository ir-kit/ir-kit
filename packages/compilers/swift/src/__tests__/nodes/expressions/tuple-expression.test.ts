import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("tuple expression", () => {
  it("with labeled elements", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createTupleExpression([
            { expression: swift.factory.createIntegerLiteral("1"), label: "x" },
            { expression: swift.factory.createIntegerLiteral("2"), label: "y" },
          ]),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "tuple-expression.swift");
  });
});
