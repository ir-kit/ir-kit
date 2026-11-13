import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("super expression", () => {
  it("super call", async () => {
    const node = f.createFunctionDeclaration(
      "render",
      [],
      undefined,
      undefined,
      f.createCallExpression(
        f.createNavigationExpression(
          f.createSuperExpression(),
          f.createIdentifier("render"),
        ),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "super-call.kt");
  });

  it("qualified super", async () => {
    const node = f.createFunctionDeclaration(
      "draw",
      [],
      undefined,
      undefined,
      f.createCallExpression(
        f.createNavigationExpression(
          f.createSuperExpression("View"),
          f.createIdentifier("draw"),
        ),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "qualified-super.kt");
  });
});
