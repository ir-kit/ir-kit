import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("try-with-resources", () => {
  it("single resource with catch and finally", async () => {
    const tryBlock = [
      java.factory.createExpressionStatement(
        java.factory.createCallExpression(
          java.factory.createIdentifier("read"),
          [],
        ),
      ),
    ];

    const resources = [
      {
        initializer: java.factory.createCallExpression(
          java.factory.createIdentifier("openReader"),
          [],
        ),
        name: "br",
        type: java.factory.createIdentifier("BufferedReader"),
      },
    ];

    const catchClauses = [
      {
        body: [
          java.factory.createExpressionStatement(
            java.factory.createCallExpression(
              java.factory.createIdentifier("handle"),
              [java.factory.createIdentifier("e")],
            ),
          ),
        ],
        parameterName: "e",
        parameterType: "IOException",
      },
    ];

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
      catchClauses.map((c) =>
        java.factory.createCatchClause(
          c.parameterName,
          c.body,
          c.parameterType,
        ),
      ),
      finallyBlock,
      resources,
    );
    const file = java.factory.createSourceFile(undefined, [stmt]);
    await assertPrintedMatchesSnapshot(file, "try-with-resources.java");
  });
});
