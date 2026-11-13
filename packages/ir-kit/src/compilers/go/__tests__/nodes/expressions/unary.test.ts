import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("unary expression", () => {
  it("plus", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "a",
            go.factory.createLiteral(5),
          ),
          go.factory.createShortVarDeclaration(
            "x",
            go.factory.createUnaryExpression(
              "+",
              go.factory.createIdentifier("a"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("x")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "plus.go");
  });

  it("minus", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "a",
            go.factory.createLiteral(5),
          ),
          go.factory.createShortVarDeclaration(
            "x",
            go.factory.createUnaryExpression(
              "-",
              go.factory.createIdentifier("a"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("x")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "minus.go");
  });

  it("logical not", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "flag",
            go.factory.createLiteral(true),
          ),
          go.factory.createShortVarDeclaration(
            "b",
            go.factory.createUnaryExpression(
              "!",
              go.factory.createIdentifier("flag"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("b")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "not.go");
  });

  it("bitwise not", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "mask",
            go.factory.createLiteral(5),
          ),
          go.factory.createShortVarDeclaration(
            "y",
            go.factory.createUnaryExpression(
              "^",
              go.factory.createIdentifier("mask"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("y")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "bitwise-not.go");
  });

  it("address-of", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "x",
            go.factory.createLiteral(42),
          ),
          go.factory.createShortVarDeclaration(
            "p",
            go.factory.createUnaryExpression(
              "&",
              go.factory.createIdentifier("x"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("p")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "address-of.go");
  });

  it("deref", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "x",
            go.factory.createLiteral(42),
          ),
          go.factory.createShortVarDeclaration(
            "p",
            go.factory.createUnaryExpression(
              "&",
              go.factory.createIdentifier("x"),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createUnaryExpression(
              "*",
              go.factory.createIdentifier("p"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("v")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "deref.go");
  });
});
