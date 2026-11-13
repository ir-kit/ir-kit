import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("slice expression", () => {
  it("a[i:j]", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          // a := [4]int{10,20,30,40}
          go.factory.createShortVarDeclaration(
            "a",
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(10),
                go.factory.createLiteral(20),
                go.factory.createLiteral(30),
                go.factory.createLiteral(40),
              ],
              go.factory.createArrayType(
                go.factory.createIdentifier("int"),
                go.factory.createLiteral(4),
              ),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "i",
            go.factory.createLiteral(1),
          ),
          go.factory.createShortVarDeclaration(
            "j",
            go.factory.createLiteral(3),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createIdentifier("a"),
              go.factory.createIdentifier("i"),
              go.factory.createIdentifier("j"),
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

    await assertPrintedMatchesSnapshot(file, "basic-slice.go");
  });

  it("a[i:]", async () => {
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
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(10),
                go.factory.createLiteral(20),
                go.factory.createLiteral(30),
                go.factory.createLiteral(40),
              ],
              go.factory.createArrayType(
                go.factory.createIdentifier("int"),
                go.factory.createLiteral(4),
              ),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "i",
            go.factory.createLiteral(2),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createIdentifier("a"),
              go.factory.createIdentifier("i"),
              undefined,
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

    await assertPrintedMatchesSnapshot(file, "slice-low.go");
  });

  it("a[:j]", async () => {
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
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(10),
                go.factory.createLiteral(20),
                go.factory.createLiteral(30),
                go.factory.createLiteral(40),
              ],
              go.factory.createArrayType(
                go.factory.createIdentifier("int"),
                go.factory.createLiteral(4),
              ),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "j",
            go.factory.createLiteral(2),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createIdentifier("a"),
              undefined,
              go.factory.createIdentifier("j"),
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

    await assertPrintedMatchesSnapshot(file, "slice-high.go");
  });

  it("a[:]", async () => {
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
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(10),
                go.factory.createLiteral(20),
                go.factory.createLiteral(30),
                go.factory.createLiteral(40),
              ],
              go.factory.createArrayType(
                go.factory.createIdentifier("int"),
                go.factory.createLiteral(4),
              ),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createIdentifier("a"),
              undefined,
              undefined,
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

    await assertPrintedMatchesSnapshot(file, "slice-empty.go");
  });

  it("a[i:j:k]", async () => {
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
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(10),
                go.factory.createLiteral(20),
                go.factory.createLiteral(30),
                go.factory.createLiteral(40),
              ],
              go.factory.createArrayType(
                go.factory.createIdentifier("int"),
                go.factory.createLiteral(4),
              ),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "i",
            go.factory.createLiteral(1),
          ),
          go.factory.createShortVarDeclaration(
            "j",
            go.factory.createLiteral(3),
          ),
          go.factory.createShortVarDeclaration(
            "k",
            go.factory.createLiteral(3),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createIdentifier("a"),
              go.factory.createIdentifier("i"),
              go.factory.createIdentifier("j"),
              go.factory.createIdentifier("k"),
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

    await assertPrintedMatchesSnapshot(file, "slice-max.go");
  });

  it("chained: a[i].Foo()[k:l]", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      // type T struct{}
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("T", go.factory.createStructType([])),
      ]),
      // func (t T) Foo() []int { return []int{1,2,3,4} }
      go.factory.createFunctionDeclaration(
        {
          name: "t",
          type: go.factory.createIdentifier("T"),
        },
        "Foo",
        undefined,
        [],
        [
          go.factory.createFunctionReturn(
            go.factory.createArrayType(go.factory.createIdentifier("int")),
          ),
        ],
        [
          go.factory.createReturnStatement(
            go.factory.createCompositeLiteral(
              [
                go.factory.createLiteral(1),
                go.factory.createLiteral(2),
                go.factory.createLiteral(3),
                go.factory.createLiteral(4),
              ],
              go.factory.createArrayType(go.factory.createIdentifier("int")),
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
          // a := []T{T{}, T{}}
          go.factory.createShortVarDeclaration(
            "a",
            go.factory.createCompositeLiteral(
              [
                go.factory.createCompositeLiteral(
                  [],
                  go.factory.createIdentifier("T"),
                ),
                go.factory.createCompositeLiteral(
                  [],
                  go.factory.createIdentifier("T"),
                ),
              ],
              go.factory.createArrayType(go.factory.createIdentifier("T")),
            ),
          ),
          go.factory.createShortVarDeclaration(
            "i",
            go.factory.createLiteral(0),
          ),
          go.factory.createShortVarDeclaration(
            "k",
            go.factory.createLiteral(1),
          ),
          go.factory.createShortVarDeclaration(
            "l",
            go.factory.createLiteral(3),
          ),
          go.factory.createShortVarDeclaration(
            "v",
            go.factory.createSliceExpression(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIndexExpression(
                    go.factory.createIdentifier("a"),
                    go.factory.createIdentifier("i"),
                  ),
                  go.factory.createIdentifier("Foo"),
                ),
                [],
              ),
              go.factory.createIdentifier("k"),
              go.factory.createIdentifier("l"),
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

    await assertPrintedMatchesSnapshot(file, "slice-chained.go");
  });
});
