import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("unary expression", () => {
  it("print prefix and postfix", async () => {
    const a = java.factory.createIdentifier("a");
    const pre = java.factory.createUnaryExpression("++", a);
    const post = java.factory.createUnaryExpression("++", a, true);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(pre),
      java.factory.createExpressionStatement(post),
    ]);

    await assertPrintedMatchesSnapshot(file, "unary.java");
  });
});
