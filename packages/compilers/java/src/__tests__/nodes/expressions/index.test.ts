import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("index expression", () => {
  it("print array index", async () => {
    const arr = java.factory.createIdentifier("arr");
    const i = java.factory.createIdentifier("i");
    const idx = java.factory.createIndexExpression(arr, i);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(idx),
    ]);

    await assertPrintedMatchesSnapshot(file, "index.java");
  });
});
