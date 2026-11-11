import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("new expressions", () => {
  it("anonymous class empty", async () => {
    const expr = java.factory.createNewAnonymousClassExpression(
      java.factory.createIdentifier("Runnable"),
      [],
      [],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(expr),
    ]);
    await assertPrintedMatchesSnapshot(file, "new-anon-empty.java");
  });

  it("anonymous class with method", async () => {
    const runMethod = java.factory.createMethodDeclaration(
      "run",
      [],
      java.factory.createIdentifier("void"),
      [java.factory.createReturnStatement()],
      ["public"],
      [],
    );
    const expr = java.factory.createNewAnonymousClassExpression(
      java.factory.createIdentifier("Runnable"),
      [],
      [runMethod],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(expr),
    ]);
    await assertPrintedMatchesSnapshot(file, "new-anon-method.java");
  });

  it("print new class instance", async () => {
    const classIdent = java.factory.createIdentifier("ArrayList");
    const newExpr = java.factory.createNewExpression(classIdent, [
      java.factory.createLiteral(10),
    ]);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(newExpr),
    ]);

    await assertPrintedMatchesSnapshot(file, "new.java");
  });
});
