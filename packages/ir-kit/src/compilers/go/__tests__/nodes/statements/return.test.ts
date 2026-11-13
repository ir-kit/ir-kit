import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("return statement", () => {
  it("return with value", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "getValue",
        undefined,
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier("int"))],
        [go.factory.createReturnStatement(go.factory.createLiteral(42))],
      ),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createCallExpression(
                  go.factory.createIdentifier("getValue"),
                  [],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-value.go");
  });

  it("return with multiple values", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "getValue",
        undefined,
        undefined,
        [
          go.factory.createFunctionReturn(go.factory.createIdentifier("int")),
          go.factory.createFunctionReturn(go.factory.createIdentifier("int")),
          go.factory.createFunctionReturn(go.factory.createIdentifier("int")),
        ],
        [
          go.factory.createReturnStatement([
            go.factory.createLiteral(42),
            go.factory.createLiteral(43),
            go.factory.createLiteral(44),
          ]),
        ],
      ),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            ["x", "y", "z"],
            [
              go.factory.createCallExpression(
                go.factory.createIdentifier("getValue"),
                [],
              ),
            ],
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createIdentifier("x"),
                go.factory.createIdentifier("y"),
                go.factory.createIdentifier("z"),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-multiple-values.go");
  });

  it("return without value", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createFunctionDeclaration(
        undefined,
        "doSomething",
        undefined,
        undefined,
        undefined,
        [go.factory.createReturnStatement()],
      ),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createIdentifier("doSomething"),
              [],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "without-value.go");
  });

  it("return with expression", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "calculate",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["a"],
            go.factory.createIdentifier("int"),
          ),
          go.factory.createFunctionParameter(
            ["b"],
            go.factory.createIdentifier("int"),
          ),
        ],
        [go.factory.createFunctionReturn(go.factory.createIdentifier("int"))],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createIdentifier("a"),
              "+",
              go.factory.createIdentifier("b"),
            ),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createCallExpression(
                  go.factory.createIdentifier("calculate"),
                  [go.factory.createLiteral(2), go.factory.createLiteral(3)],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-expression.go");
  });
});
