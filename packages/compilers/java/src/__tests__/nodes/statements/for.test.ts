import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("for", () => {
  it("empty header with body", async () => {
    const body = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createMemberExpression(
            java.factory.createIdentifier("System"),
            java.factory.createIdentifier("out"),
          ),
          [java.factory.createLiteral("tick")],
        ),
      ),
      java.factory.createBreakStatement(),
    ];
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createForStatement(undefined, undefined, undefined, body),
    ]);
    await assertPrintedMatchesSnapshot(file, "for.java");
  });
});
