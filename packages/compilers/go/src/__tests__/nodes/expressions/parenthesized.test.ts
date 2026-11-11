import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("parenthesized expression", () => {
  it("groups a binary expression to force precedence", async () => {
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
            go.factory.createLiteral(1),
          ),
          go.factory.createShortVarDeclaration(
            "b",
            go.factory.createLiteral(2),
          ),
          go.factory.createShortVarDeclaration(
            "c",
            go.factory.createLiteral(3),
          ),
          go.factory.createShortVarDeclaration(
            "result",
            go.factory.createBinaryExpression(
              go.factory.createParenthesizedExpression(
                go.factory.createBinaryExpression(
                  go.factory.createIdentifier("a"),
                  "+",
                  go.factory.createIdentifier("b"),
                ),
              ),
              "*",
              go.factory.createIdentifier("c"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("result")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "parenthesized.go");
  });
});
