import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("is expression", () => {
  it("type check", async () => {
    const node = f.createFunctionDeclaration(
      "check",
      [],
      undefined,
      undefined,
      f.createIsExpression(
        f.createIdentifier("value"),
        f.createUserType("String"),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "type-check.kt");
  });

  it("negated type check", async () => {
    const node = f.createFunctionDeclaration(
      "missing",
      [],
      undefined,
      undefined,
      f.createIsExpression(
        f.createIdentifier("value"),
        f.createUserType("Int"),
        true,
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "negated.kt");
  });
});
