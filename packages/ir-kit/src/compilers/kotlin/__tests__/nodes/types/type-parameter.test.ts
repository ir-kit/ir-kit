import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("TypeParameter", () => {
  it("bounded type parameter", async () => {
    const identity = f.createFunctionDeclaration(
      "identity",
      [f.createParameter("value", f.createUserType("T"))],
      f.createUserType("T"),
      undefined,
      f.createIdentifier("value"),
      undefined,
      undefined,
      undefined,
      [f.createTypeParameter("T", [f.createUserType("Any")])],
    );
    await assertPrintedMatchesSnapshot(file([identity]), "bounded.kt");
  });

  it("reified type parameter on inline function", async () => {
    const create = f.createFunctionDeclaration(
      "create",
      [f.createParameter("value", f.createUserType("T"))],
      f.createUserType("T"),
      undefined,
      f.createIdentifier("value"),
      ["inline"],
      undefined,
      undefined,
      [f.createTypeParameter("T", undefined, undefined, true)],
    );
    await assertPrintedMatchesSnapshot(file([create]), "reified.kt");
  });

  it("variance and multiple bounds", async () => {
    const box = f.createClassDeclaration(
      "Box",
      f.createPrimaryConstructor([
        f.createParameter("value", f.createUserType("T"), undefined, "val"),
      ]),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [f.createTypeParameter("T", undefined, "out")],
    );
    const pick = f.createFunctionDeclaration(
      "pick",
      [f.createParameter("value", f.createUserType("T"))],
      f.createUserType("T"),
      undefined,
      f.createIdentifier("value"),
      undefined,
      undefined,
      undefined,
      [
        f.createTypeParameter("T", [
          f.createUserType("Comparable", [f.createUserType("T")]),
          f.createUserType("Cloneable"),
        ]),
      ],
    );
    await assertPrintedMatchesSnapshot(
      file([box, pick]),
      "variance-and-bounds.kt",
    );
  });
});
