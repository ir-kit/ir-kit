import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("interface type via type declaration", () => {
  it("empty interface", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("Any", go.factory.createInterfaceType([])),
      ]),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createVariableStatement(
            undefined,
            go.factory.createVariableDeclarationList(
              [
                go.factory.createVariableDeclaration(
                  "x",
                  go.factory.createIdentifier("Any"),
                  go.factory.createLiteral(123),
                ),
              ],
              go.NodeFlags.Var,
            ),
          ),
          go.factory.createEmptyStatement(),
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
    await assertPrintedMatchesSnapshot(file, "empty.go");
  });

  it("single method with named returns", async () => {
    const reader = go.factory.createInterfaceType([
      {
        name: "Read",
        parameters: [
          go.factory.createFunctionParameter(
            ["p"],
            go.factory.createArrayType(go.factory.createIdentifier("byte")),
          ),
        ],
        returnType: [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("int"),
            "n",
          ),
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("error"),
            "err",
          ),
        ],
      },
    ]);

    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("Reader", reader),
      ]),
      // concrete type implementing Reader
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("MemReader", go.factory.createStructType([])),
      ]),
      go.factory.createFunctionDeclaration(
        {
          name: "m",
          type: go.factory.createIdentifier("MemReader"),
        },
        "Read",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["p"],
            go.factory.createArrayType(go.factory.createIdentifier("byte")),
          ),
        ],
        [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("int"),
            "n",
          ),
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("error"),
            "err",
          ),
        ],
        [
          go.factory.createReturnStatement([
            go.factory.createLiteral(0),
            go.factory.createLiteral(null),
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
            "buf",
            go.factory.createCompositeLiteral(
              [],
              go.factory.createArrayType(go.factory.createIdentifier("byte")),
            ),
          ),
          go.factory.createShortVarDeclaration(
            ["r"],
            go.factory.createCompositeLiteral(
              [],
              go.factory.createIdentifier("MemReader"),
            ),
          ),
          go.factory.createEmptyStatement(),
          go.factory.createShortVarDeclaration(
            ["n", "err"],
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("r"),
                go.factory.createIdentifier("Read"),
              ),
              [go.factory.createIdentifier("buf")],
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createIdentifier("n"),
                go.factory.createIdentifier("err"),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "single-method.go");
  });

  it("multiple methods with and without returns", async () => {
    const shape = go.factory.createInterfaceType([
      {
        name: "Area",
        parameters: [],
        returnType: [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("float64"),
          ),
        ],
      },
      {
        name: "Scale",
        parameters: [
          go.factory.createFunctionParameter(
            ["factor"],
            go.factory.createIdentifier("float64"),
          ),
        ],
        returnType: [],
      },
      {
        name: "Move",
        parameters: [
          go.factory.createFunctionParameter(
            ["x"],
            go.factory.createIdentifier("int"),
          ),
          go.factory.createFunctionParameter(
            ["y"],
            go.factory.createIdentifier("int"),
          ),
        ],
        returnType: [],
      },
    ]);

    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("Shape", shape),
      ]),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          "Rectangle",
          go.factory.createStructType([
            { names: ["W"], type: go.factory.createIdentifier("float64") },
            { names: ["H"], type: go.factory.createIdentifier("float64") },
          ]),
        ),
      ]),
      go.factory.createFunctionDeclaration(
        {
          name: "r",
          type: go.factory.createIdentifier("Rectangle"),
        },
        "Area",
        undefined,
        [],
        [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("float64"),
          ),
        ],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createBinaryExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier("r"),
                  go.factory.createIdentifier("W"),
                ),
                "*",
                go.factory.createMemberExpression(
                  go.factory.createIdentifier("r"),
                  go.factory.createIdentifier("H"),
                ),
              ),
              "*",
              go.factory.createLiteral(0.5),
            ),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration(
        {
          name: "r",
          type: go.factory.createIdentifier("Rectangle"),
        },
        "Scale",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["factor"],
            go.factory.createIdentifier("float64"),
          ),
        ],
        [],
        [
          go.factory.createAugmentAssignment(
            go.factory.createMemberExpression(
              go.factory.createIdentifier("r"),
              go.factory.createIdentifier("W"),
            ),
            "*=",
            go.factory.createIdentifier("factor"),
          ),
          go.factory.createAugmentAssignment(
            go.factory.createMemberExpression(
              go.factory.createIdentifier("r"),
              go.factory.createIdentifier("H"),
            ),
            "*=",
            go.factory.createIdentifier("factor"),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration(
        {
          name: "r",
          type: go.factory.createIdentifier("Rectangle"),
        },
        "Move",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["x"],
            go.factory.createIdentifier("int"),
          ),
          go.factory.createFunctionParameter(
            ["y"],
            go.factory.createIdentifier("int"),
          ),
        ],
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Printf"),
              ),
              [
                go.factory.createLiteral("Moved to (%d, %d)"),
                go.factory.createIdentifier("x"),
                go.factory.createIdentifier("y"),
              ],
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
          go.factory.createShortVarDeclaration(
            "s",
            go.factory.createCompositeLiteral(
              [
                go.factory.createKeyValueExpression(
                  go.factory.createIdentifier("W"),
                  go.factory.createLiteral(3),
                ),
                go.factory.createKeyValueExpression(
                  go.factory.createIdentifier("H"),
                  go.factory.createLiteral(4),
                ),
              ],
              go.factory.createIdentifier("Rectangle"),
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("s"),
                go.factory.createIdentifier("Scale"),
              ),
              [go.factory.createLiteral(2)],
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier("s"),
                    go.factory.createIdentifier("Area"),
                  ),
                ),
              ],
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("s"),
                go.factory.createIdentifier("Move"),
              ),
              [go.factory.createLiteral(1), go.factory.createLiteral(2)],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "multiple-methods.go");
  });

  it("embedded interface", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("io"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          "ReadWriter",
          go.factory.createInterfaceType([
            {
              embed: go.factory.createMemberExpression(
                go.factory.createIdentifier("io"),
                go.factory.createIdentifier("Reader"),
              ),
            },
            {
              name: "Write",
              parameters: [
                go.factory.createFunctionParameter(
                  ["p"],
                  go.factory.createArrayType(
                    go.factory.createIdentifier("byte"),
                  ),
                ),
              ],
              returnType: [
                go.factory.createFunctionReturn(
                  go.factory.createIdentifier("int"),
                  "n",
                ),
                go.factory.createFunctionReturn(
                  go.factory.createIdentifier("error"),
                  "err",
                ),
              ],
            },
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "embedded.go");
  });

  it("type-set constraint with approximation and union", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          "Number",
          go.factory.createInterfaceType([
            {
              embed: go.factory.createTypeSet([
                { approximate: true, type: go.factory.createIdentifier("int") },
                {
                  approximate: true,
                  type: go.factory.createIdentifier("float64"),
                },
              ]),
            },
          ]),
        ),
      ]),
      go.factory.createFunctionDeclaration(
        undefined,
        "double",
        [{ constraint: go.factory.createIdentifier("Number"), names: ["T"] }],
        [
          go.factory.createFunctionParameter(
            ["x"],
            go.factory.createIdentifier("T"),
          ),
        ],
        [go.factory.createFunctionReturn(go.factory.createIdentifier("T"))],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createIdentifier("x"),
              "+",
              go.factory.createIdentifier("x"),
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
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "type-set-constraint.go");
  });

  it("method and embed comments", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("context"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          "PetAPI",
          go.factory.createInterfaceType([
            {
              embed: go.factory.createIdentifier("error"),
              leadingComments: ["Errors are values."],
            },
            {
              leadingComments: ["GET /pet/{id}"],
              name: "GetPet",
              parameters: [
                go.factory.createFunctionParameter(
                  ["ctx"],
                  go.factory.createIdentifier("context.Context"),
                ),
              ],
              returnType: [
                go.factory.createFunctionReturn(
                  go.factory.createIdentifier("error"),
                ),
              ],
            },
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "method-comments.go");
  });
});
