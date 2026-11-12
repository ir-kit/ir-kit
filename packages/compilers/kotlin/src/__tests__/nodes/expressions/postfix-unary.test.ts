import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

describe("postfix unary expression", () => {
  it("not-null assertion", async () => {
    const node = f.createFunctionDeclaration(
      "unwrap",
      [
        f.createParameter(
          "value",
          f.createNullableType(f.createUserType("String")),
        ),
      ],
      f.createUserType("String"),
      undefined,
      f.createPostfixUnaryExpression(id("value"), "!!"),
    );
    await assertPrintedMatchesSnapshot(file([node]), "not-null.kt");
  });

  it("increment statement", async () => {
    const node = f.createFunctionDeclaration("advance", [], undefined, [
      f.createProperty("i", "var", undefined, f.createLiteral("0", "int")),
      f.createExpressionStatement(
        f.createPostfixUnaryExpression(id("i"), "++"),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "increment.kt");
  });
});
