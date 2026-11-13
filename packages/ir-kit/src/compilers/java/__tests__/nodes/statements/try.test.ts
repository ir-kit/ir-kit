import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("try statement", () => {
  it("print try/catch/finally", async () => {
    const tryBlock = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createIdentifier("doWork"),
          [],
        ),
      ),
    ];

    const catchClause = java.factory.createCatchClause(
      "e",
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createIdentifier("handle"),
            [java.factory.createIdentifier("e")],
          ),
        ),
      ],
      "Exception",
    );

    const finallyBlock = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createIdentifier("cleanup"),
          [],
        ),
      ),
    ];

    const stmt = java.factory.createTryStatement(
      tryBlock,
      [catchClause],
      finallyBlock,
    );
    const file = java.factory.createSourceFile(undefined, [stmt]);
    await assertPrintedMatchesSnapshot(file, "try.java");
  });
});
