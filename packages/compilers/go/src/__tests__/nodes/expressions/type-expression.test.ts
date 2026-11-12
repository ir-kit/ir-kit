import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

const f = go.factory;

describe("type expression", () => {
  it("uses types as conversion callees", async () => {
    const file = f.createSourceFile("main", [
      f.createFunctionDeclaration(
        undefined,
        "convert",
        undefined,
        [f.createFunctionParameter(["n"], f.createIdentifier("int"))],
        undefined,
        [
          f.createShortVarDeclaration(
            "big",
            f.createCallExpression(
              f.createTypeExpression(f.createIdentifier("int64")),
              [f.createIdentifier("n")],
            ),
          ),
          f.createShortVarDeclaration(
            "raw",
            f.createCallExpression(
              f.createTypeExpression(
                f.createArrayType(f.createIdentifier("byte")),
              ),
              [f.createLiteral("go")],
            ),
          ),
          f.createShortVarDeclaration(
            "none",
            f.createCallExpression(
              f.createTypeExpression(
                f.createPointerType(f.createIdentifier("int64")),
              ),
              [f.createIdentifier("nil")],
            ),
          ),
          f.createAssignment(
            [f.createIdentifier("_")],
            [f.createIdentifier("none")],
          ),
          f.createAssignment(
            [f.createIdentifier("_")],
            [f.createIdentifier("big")],
          ),
          f.createAssignment(
            [f.createIdentifier("_")],
            [f.createIdentifier("raw")],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "type-expression.go");
  });
});
