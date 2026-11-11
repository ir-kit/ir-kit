import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("instanceof expression", () => {
  it("print instanceof", async () => {
    const expr = java.factory.createIdentifier("obj");
    const type = java.factory.createIdentifier("String");
    const inst = java.factory.createInstanceOfExpression(expr, type);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(inst),
    ]);

    await assertPrintedMatchesSnapshot(file, "instanceof.java");
  });
});
