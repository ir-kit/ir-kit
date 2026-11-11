import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("callable reference", () => {
  it("class reference", async () => {
    const node = f.createFunctionDeclaration(
      "token",
      [],
      undefined,
      undefined,
      f.createCallableReference("class", f.createIdentifier("String")),
    );
    await assertPrintedMatchesSnapshot(file([node]), "class-reference.kt");
  });

  it("unbound function reference", async () => {
    const node = f.createFunctionDeclaration(
      "predicate",
      [],
      undefined,
      undefined,
      f.createCallableReference("isValid"),
    );
    await assertPrintedMatchesSnapshot(file([node]), "unbound-reference.kt");
  });
});
