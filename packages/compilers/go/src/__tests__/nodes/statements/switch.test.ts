import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("switch statement", () => {
  it("value switch with multiple cases and default", async () => {
    const x = go.factory.createIdentifier("x");
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
            go.factory.createLiteral(2),
          ),
          go.factory.createSwitchStatement(
            [
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Println"),
                      ),
                      [go.factory.createLiteral("zero")],
                    ),
                  ),
                ],
                [go.factory.createLiteral(0)],
              ),
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Println"),
                      ),
                      [go.factory.createLiteral("one or two")],
                    ),
                  ),
                ],
                [go.factory.createLiteral(1), go.factory.createLiteral(2)],
              ),
              go.factory.createSwitchCase([
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier("fmt"),
                      go.factory.createIdentifier("Println"),
                    ),
                    [go.factory.createLiteral("other")],
                  ),
                ),
              ]),
            ],
            x,
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "value-switch.go");
  });

  it("missing expression switch (switch true)", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createSwitchStatement([
            go.factory.createSwitchCase(
              [
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier("fmt"),
                      go.factory.createIdentifier("Println"),
                    ),
                    [go.factory.createLiteral("true")],
                  ),
                ),
              ],
              [go.factory.createLiteral(true)],
            ),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "missing-expression.go");
  });

  it("fallthrough between cases", async () => {
    const x = go.factory.createIdentifier("x");
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
          go.factory.createSwitchStatement(
            [
              go.factory.createSwitchCase(
                [go.factory.createFallthroughStatement()],
                [go.factory.createLiteral(100)],
              ),
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Println"),
                      ),
                      [go.factory.createLiteral("hit 42")],
                    ),
                  ),
                  go.factory.createFallthroughStatement(),
                ],
                [go.factory.createLiteral(42)],
              ),
              go.factory.createSwitchCase([
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier("fmt"),
                      go.factory.createIdentifier("Println"),
                    ),
                    [go.factory.createLiteral("after fallthrough")],
                  ),
                ),
              ]),
            ],
            x,
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "fallthrough.go");
  });

  it("type switch with assignment", async () => {
    const subject = go.factory.createIdentifier("v");
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
            "v",
            go.factory.createLiteral(5),
          ),
          go.factory.createSwitchStatement(
            [
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Printf"),
                      ),
                      [
                        go.factory.createLiteral("int %v\n"),
                        go.factory.createIdentifier("x"),
                      ],
                    ),
                  ),
                ],
                [go.factory.createIdentifier("int")],
              ),
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Printf"),
                      ),
                      [
                        go.factory.createLiteral("string %v\n"),
                        go.factory.createIdentifier("x"),
                      ],
                    ),
                  ),
                ],
                [go.factory.createIdentifier("string")],
              ),
              go.factory.createSwitchCase([
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier("fmt"),
                      go.factory.createIdentifier("Printf"),
                    ),
                    [
                      go.factory.createLiteral("unknown %v\n"),
                      go.factory.createIdentifier("x"),
                    ],
                  ),
                ),
              ]),
            ],
            undefined,
            undefined,
            {
              assignTo: "x",
              subject: go.factory.createCallExpression(
                go.factory.createIdentifier("any"),
                [subject],
              ),
            },
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "type-switch.go");
  });

  it("switch with init statement", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createSwitchStatement(
            [
              go.factory.createSwitchCase(
                [
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier("fmt"),
                        go.factory.createIdentifier("Println"),
                      ),
                      [go.factory.createLiteral("ok")],
                    ),
                  ),
                ],
                [go.factory.createLiteral(true)],
              ),
            ],
            go.factory.createIdentifier("cond"),
            go.factory.createShortVarDeclaration(
              "cond",
              go.factory.createLiteral(true),
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-init.go");
  });
});
