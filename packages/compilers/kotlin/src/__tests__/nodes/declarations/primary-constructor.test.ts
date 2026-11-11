import { assertPrintedMatchesSnapshot, f, file, t } from "../utils.js";

describe("primary constructor", () => {
  it("value parameters", async () => {
    const node = f.createClassDeclaration(
      "Point",
      f.createPrimaryConstructor([
        f.createParameter("x", t("Int"), undefined, "val"),
        f.createParameter("y", t("Int"), undefined, "val"),
      ]),
      undefined,
      ["data"],
    );
    await assertPrintedMatchesSnapshot(file([node]), "value-parameters.kt");
  });

  it("private constructor with modifiers", async () => {
    const node = f.createClassDeclaration(
      "Singleton",
      f.createPrimaryConstructor(
        [f.createParameter("id", t("String"), undefined, "val")],
        ["private"],
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "private-constructor.kt");
  });

  it("non-val parameters forwarded to a supertype", async () => {
    const node = f.createClassDeclaration(
      "Child",
      f.createPrimaryConstructor([f.createParameter("name", t("String"))]),
      undefined,
      undefined,
      undefined,
      [
        {
          arguments: [{ expression: f.createIdentifier("name") }],
          type: t("Parent"),
        },
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "forwarded-parameters.kt");
  });
});
