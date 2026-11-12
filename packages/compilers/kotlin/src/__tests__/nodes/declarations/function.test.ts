import { assertPrintedMatchesSnapshot, f, file, id, t } from "../utils.js";

describe("function declaration", () => {
  it("expression body", async () => {
    const node = f.createFunctionDeclaration(
      "add",
      [f.createParameter("a", t("Int")), f.createParameter("b", t("Int"))],
      t("Int"),
      undefined,
      f.createBinaryExpression(id("a"), "+", id("b")),
    );
    await assertPrintedMatchesSnapshot(file([node]), "expression-body.kt");
  });

  it("block body with multiple statements", async () => {
    const node = f.createFunctionDeclaration(
      "process",
      [f.createParameter("value", t("Int"))],
      t("Int"),
      [
        f.createExpressionStatement(
          f.createCallExpression(id("require"), [
            {
              expression: f.createBinaryExpression(
                id("value"),
                ">",
                f.createLiteral("0", "int"),
              ),
            },
          ]),
        ),
        f.createReturnStatement(
          f.createBinaryExpression(
            id("value"),
            "*",
            f.createLiteral("2", "int"),
          ),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "block-body.kt");
  });

  it("generic extension function", async () => {
    const node = f.createFunctionDeclaration(
      "second",
      [],
      f.createUserType("T"),
      undefined,
      f.createIndexingExpression(f.createThisExpression(), [
        f.createLiteral("1", "int"),
      ]),
      undefined,
      undefined,
      f.createUserType("List", [f.createUserType("T")]),
      [f.createTypeParameter("T")],
    );
    await assertPrintedMatchesSnapshot(file([node]), "extension.kt");
  });
});
