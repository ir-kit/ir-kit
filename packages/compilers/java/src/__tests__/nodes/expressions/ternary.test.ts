import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("ternary expression", () => {
  it("print ternary", async () => {
    const a = java.factory.createIdentifier("a");
    const b = java.factory.createIdentifier("b");
    const cond = java.factory.createBinaryExpression(a, ">", b);
    const tern = java.factory.createTernaryExpression(cond, a, b);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(tern),
    ]);

    await assertPrintedMatchesSnapshot(file, "ternary.java");
  });
});
