import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("function declaration", () => {
  it("simple function without parameters", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "sayHello",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration(
            "message",
            go.factory.createLiteral("Hello!"),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("message")],
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
              go.factory.createIdentifier("sayHello"),
              [],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "simple-no-params.go");
  });

  it("function with return type", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "getNumber",
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
                  go.factory.createIdentifier("getNumber"),
                  [],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-return-type.go");
  });

  it("function with named return type", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "getNumber",
        undefined,
        undefined,
        [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("int"),
            "result",
          ),
        ],
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
                  go.factory.createIdentifier("getNumber"),
                  [],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-named-return-type.go");
  });

  it("function with parameters", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "add",
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
                  go.factory.createIdentifier("add"),
                  [go.factory.createLiteral(1), go.factory.createLiteral(2)],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-parameters.go");
  });

  it("function with mixed parameters", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "greet",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["name"],
            go.factory.createIdentifier("string"),
          ),
          go.factory.createFunctionParameter(
            ["times"],
            go.factory.createIdentifier("int"),
          ),
        ],
        [
          go.factory.createFunctionReturn(
            go.factory.createIdentifier("string"),
          ),
        ],
        [
          go.factory.createReturnStatement(
            go.factory.createLiteral("greeting"),
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
                  go.factory.createIdentifier("greet"),
                  [
                    go.factory.createLiteral("John"),
                    go.factory.createLiteral(2),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "mixed-parameters.go");
  });

  it("empty function", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createFunctionDeclaration(
        undefined,
        "doNothing",
        undefined,
        undefined,
        undefined,
        undefined,
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
              go.factory.createIdentifier("doNothing"),
              [],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "empty-function.go");
  });

  it("prints a method with receiver and variadic parameter", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("Some", go.factory.createStructType([])),
      ]),
      go.factory.createFunctionDeclaration(
        {
          name: "s",
          type: go.factory.createIdentifier("Some"),
        },
        "Sum",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["nums"],
            go.factory.createIdentifier("int"),
            true,
          ),
        ],
        [go.factory.createFunctionReturn(go.factory.createIdentifier("int"))],
        [go.factory.createReturnStatement(go.factory.createLiteral(0))],
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
              [],
              go.factory.createIdentifier("Some"),
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
                    go.factory.createIdentifier("Sum"),
                  ),
                  [
                    go.factory.createLiteral(1),
                    go.factory.createLiteral(2),
                    go.factory.createLiteral(3),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);

    await assertPrintedMatchesSnapshot(file, "function-receiver-variadic.go");
  });

  it("prints defer and go calls inside a function", async () => {
    const printf = go.factory.createMemberExpression(
      go.factory.createIdentifier("fmt"),
      go.factory.createIdentifier("Println"),
    );

    const workCall = go.factory.createCallExpression(
      go.factory.createIdentifier("work"),
    );

    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "run",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createGoStatement(workCall),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(printf, [
              go.factory.createLiteral("running"),
            ]),
          ),
          go.factory.createReturnStatement(),
        ],
      ),
      go.factory.createFunctionDeclaration(
        undefined,
        "work",
        undefined,
        undefined,
        undefined,
        undefined,
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
              go.factory.createIdentifier("run"),
              [],
            ),
          ),
        ],
      ),
    ]);

    await assertPrintedMatchesSnapshot(file, "defer-and-go-calls.go");
  });

  it("assigns anonymous function to short var", async () => {
    const anonFunc = go.factory.createFunctionLiteral(
      [
        go.factory.createFunctionParameter(
          ["x"],
          go.factory.createIdentifier("int"),
        ),
      ],
      [go.factory.createFunctionReturn(go.factory.createIdentifier("int"))],
      [
        go.factory.createReturnStatement(
          go.factory.createBinaryExpression(
            go.factory.createIdentifier("x"),
            "+",
            go.factory.createLiteral(1),
          ),
        ),
      ],
    );

    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createShortVarDeclaration("inc", anonFunc),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createCallExpression(
                  go.factory.createIdentifier("inc"),
                  [go.factory.createLiteral(5)],
                ),
              ],
            ),
          ),
        ],
      ),
    ]);

    await assertPrintedMatchesSnapshot(file, "shortvar-anon-func.go");
  });

  it("grouped parameter names", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createFunctionDeclaration(
        undefined,
        "add",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["a", "b"],
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
    ]);
    await assertPrintedMatchesSnapshot(file, "grouped-parameter-names.go");
  });

  it("unnamed receiver and blank lines between multi-line decls", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("A", go.factory.createIdentifier("int")),
      ]),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("B", go.factory.createIdentifier("string")),
      ]),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          "C",
          go.factory.createStructType([
            { names: ["X"], type: go.factory.createIdentifier("int") },
          ]),
        ),
      ]),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec("D", go.factory.createIdentifier("int")),
      ]),
      go.factory.createFunctionDeclaration(
        { name: "", type: go.factory.createIdentifier("C") },
        "isMarker",
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "unnamed-receiver.go");
  });

  it("breaks an empty body when the header reaches 100 columns", async () => {
    const recv = (type: string) => ({
      name: "",
      type: go.factory.createIdentifier(type),
    });
    const file = go.factory.createSourceFile("main", [
      go.factory.createFunctionDeclaration(
        recv("ShortCase"),
        "isShortResponse",
        undefined,
        undefined,
        undefined,
        [],
      ),
      go.factory.createFunctionDeclaration(
        recv("GetInformationAboutTheUsersCurrentPlaybackResponseStatus200"),
        "isGetInformationAboutTheUsersCurrentPlaybackResponse",
        undefined,
        undefined,
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "empty-body-wrapping.go");
  });
});
