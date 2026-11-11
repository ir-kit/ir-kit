import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("throw statement", () => {
  it("print throw new", async () => {
    const error = java.factory.createNewExpression(
      java.factory.createIdentifier("RuntimeException"),
      [java.factory.createLiteral("boom")],
    );
    const thr = java.factory.createThrowStatement(error);

    const file = java.factory.createSourceFile(undefined, [thr]);
    await assertPrintedMatchesSnapshot(file, "throw.java");
  });
});
