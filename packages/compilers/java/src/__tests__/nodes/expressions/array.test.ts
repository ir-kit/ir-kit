import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("array creation", () => {
  it("print new int[10]", async () => {
    const arr = java.factory.createArrayCreationExpression(
      java.factory.createIdentifier("int"),
      [java.factory.createLiteral(10)],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arr),
    ]);
    await assertPrintedMatchesSnapshot(file, "new-int-10.java");
  });

  it("print new int[] {1,2,3}", async () => {
    const init = java.factory.createArrayInitializer([
      java.factory.createLiteral(1),
      java.factory.createLiteral(2),
      java.factory.createLiteral(3),
    ]);
    const arr = java.factory.createArrayCreationExpression(
      java.factory.createIdentifier("int"),
      [undefined],
      init,
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arr),
    ]);
    await assertPrintedMatchesSnapshot(file, "new-int-init.java");
  });

  it("print new int[2][3]", async () => {
    const arr = java.factory.createArrayCreationExpression(
      java.factory.createIdentifier("int"),
      [java.factory.createLiteral(2), java.factory.createLiteral(3)],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arr),
    ]);
    await assertPrintedMatchesSnapshot(file, "new-int-2-3.java");
  });
});

describe("array type", () => {
  it("print int[]", async () => {
    const arrayType = java.factory.createArrayType(
      java.factory.createIdentifier("int"),
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arrayType),
    ]);
    await assertPrintedMatchesSnapshot(file, "int-array.java");
  });

  it("print int[][]", async () => {
    const arrayType = java.factory.createArrayType(
      java.factory.createIdentifier("int"),
      2,
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arrayType),
    ]);
    await assertPrintedMatchesSnapshot(file, "int-2d-array.java");
  });

  it("print String[]", async () => {
    const arrayType = java.factory.createArrayType(
      java.factory.createIdentifier("String"),
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arrayType),
    ]);
    await assertPrintedMatchesSnapshot(file, "string-array.java");
  });

  it("print List<String>[]", async () => {
    const parameterizedType = java.factory.createParameterizedType(
      java.factory.createIdentifier("List"),
      [java.factory.createIdentifier("String")],
    );
    const arrayType = java.factory.createArrayType(parameterizedType);
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(arrayType),
    ]);
    await assertPrintedMatchesSnapshot(file, "list-string-array.java");
  });
});
