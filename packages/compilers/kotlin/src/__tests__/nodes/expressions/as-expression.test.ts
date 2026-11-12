import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("as expression", () => {
  it("safe cast", async () => {
    const node = f.createFunctionDeclaration(
      "cast",
      [],
      undefined,
      undefined,
      f.createAsExpression(
        f.createIdentifier("value"),
        f.createUserType("String"),
        true,
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "safe-cast.kt");
  });

  it("unsafe cast", async () => {
    const node = f.createFunctionDeclaration(
      "coerce",
      [],
      undefined,
      undefined,
      f.createAsExpression(
        f.createIdentifier("payload"),
        f.createUserType("Map", [
          f.createUserType("String"),
          f.createUserType("String"),
        ]),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "unsafe-cast.kt");
  });
});
