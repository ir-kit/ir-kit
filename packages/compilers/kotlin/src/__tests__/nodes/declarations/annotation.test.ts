import { assertPrintedMatchesSnapshot, f, file, t } from "../utils.js";

describe("annotation", () => {
  it("plain annotation on a class", async () => {
    const node = f.createClassDeclaration(
      "Dto",
      f.createPrimaryConstructor([
        f.createParameter("id", t("String"), undefined, "val"),
      ]),
      undefined,
      ["data"],
      [f.createAnnotation("Serializable")],
    );
    await assertPrintedMatchesSnapshot(file([node]), "plain.kt");
  });

  it("annotation with named arguments", async () => {
    const node = f.createClassDeclaration(
      "User",
      f.createPrimaryConstructor([
        f.createParameter("id", t("Long"), undefined, "val"),
      ]),
      undefined,
      ["data"],
      [
        f.createAnnotation("Entity", [
          {
            expression: f.createStringLiteral([{ text: "users" }]),
            name: "name",
          },
        ]),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "named-arguments.kt");
  });

  it("annotation with a use-site target", async () => {
    const node = f.createClassDeclaration(
      "Payload",
      f.createPrimaryConstructor([
        f.createParameter("id", t("String"), undefined, "val", undefined, [
          f.createAnnotation(
            "SerialName",
            [{ expression: f.createStringLiteral([{ text: "user_id" }]) }],
            "param",
          ),
        ]),
      ]),
      undefined,
      ["data"],
    );
    await assertPrintedMatchesSnapshot(file([node]), "use-site-target.kt");
  });
});
