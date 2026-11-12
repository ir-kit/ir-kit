import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("identifier", () => {
  it("simple reference", async () => {
    const node = f.createFunctionDeclaration(
      "ref",
      [],
      undefined,
      undefined,
      f.createIdentifier("value"),
    );
    await assertPrintedMatchesSnapshot(file([node]), "reference.kt");
  });
});
