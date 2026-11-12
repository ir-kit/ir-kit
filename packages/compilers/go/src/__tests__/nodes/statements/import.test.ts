import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("import statement", () => {
  it("single import", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
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
              [go.factory.createLiteral("hi")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "single-import.go");
  });

  it("single import with alias", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement({ alias: "f", path: "fmt" }),
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
                go.factory.createIdentifier("f"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createLiteral("hi")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "single-import-with-alias.go");
  });

  it("multiple imports", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement(["fmt", "math"]),
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
                go.factory.createMemberExpression(
                  go.factory.createIdentifier("math"),
                  go.factory.createIdentifier("Pi"),
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "multiple-imports.go");
  });

  it("multiple imports with aliases", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement([
        { alias: "f", path: "fmt" },
        { alias: "m", path: "math" },
      ]),
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
                go.factory.createIdentifier("f"),
                go.factory.createIdentifier("Println"),
              ),
              [
                go.factory.createMemberExpression(
                  go.factory.createIdentifier("m"),
                  go.factory.createIdentifier("Pi"),
                ),
              ],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "multiple-imports-with-aliases.go",
    );
  });

  it("single import with parentheses", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
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
              [go.factory.createLiteral("ok")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "single-import-with-parentheses.go",
    );
  });

  it('single import with "_" alias', async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement({ alias: "_", path: "fmt" }),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "single-import-with-underscore.go",
    );
  });

  it('single import with "." alias', async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement({ alias: ".", path: "fmt" }),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createIdentifier("Println"),
              [go.factory.createLiteral("ok")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "single-import-with-dot.go");
  });
});
