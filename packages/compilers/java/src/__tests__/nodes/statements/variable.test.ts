import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("variable declaration", () => {
  it("public int a = 1;", async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        "a",
        java.factory.createIdentifier("int"),
        java.factory.createLiteral(1),
        ["public"],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "variable.java");
  });
});
