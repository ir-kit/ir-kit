import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

describe("parenthesized expression", () => {
  it("forces precedence", async () => {
    const node = f.createFunctionDeclaration(
      "calc",
      [],
      undefined,
      undefined,
      f.createBinaryExpression(
        f.createParenthesizedExpression(
          f.createBinaryExpression(id("a"), "+", id("b")),
        ),
        "*",
        f.createLiteral("2", "int"),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "precedence.kt");
  });
});
