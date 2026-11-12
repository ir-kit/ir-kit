import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("method reference", () => {
  it("static method reference", async () => {
    const expr = java.factory.createMethodReferenceExpression(
      java.factory.createIdentifier("Math"),
      "abs",
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        "f",
        java.factory.createIdentifier("Function<Integer, Integer>"),
        expr,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "method-ref-static.java");
  });

  it("instance method reference", async () => {
    const expr = java.factory.createMethodReferenceExpression(
      java.factory.createIdentifier("s"),
      "toLowerCase",
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        "g",
        java.factory.createIdentifier("Supplier<String>"),
        expr,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "method-ref-instance.java");
  });

  it("constructor method reference", async () => {
    const expr = java.factory.createMethodReferenceExpression(
      java.factory.createIdentifier("ArrayList"),
      "new",
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        "h",
        java.factory.createIdentifier("Supplier<List>"),
        expr,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "method-ref-ctor.java");
  });
});
