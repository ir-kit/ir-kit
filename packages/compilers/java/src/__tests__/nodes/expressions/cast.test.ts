import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("cast expression", () => {
  it("print cast", async () => {
    const type = java.factory.createIdentifier("int");
    const expr = java.factory.createIdentifier("myDouble");
    const cast = java.factory.createCastExpression(type, expr);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(cast),
    ]);

    await assertPrintedMatchesSnapshot(file, "cast.java");
  });
});
