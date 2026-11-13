import { assertPrintedMatchesSnapshot, f, file, t } from "../utils.js";

describe("enum entry", () => {
  it("plain entries", async () => {
    const node = f.createClassDeclaration(
      "Status",
      undefined,
      undefined,
      ["enum"],
      undefined,
      undefined,
      [
        f.createEnumEntry("ACTIVE"),
        f.createEnumEntry("INACTIVE"),
        f.createEnumEntry("PENDING"),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "plain.kt");
  });

  it("entries with value arguments", async () => {
    const entry = (name: string, rgb: string) =>
      f.createEnumEntry(name, [{ expression: f.createLiteral(rgb, "int") }]);
    const node = f.createClassDeclaration(
      "Color",
      f.createPrimaryConstructor([
        f.createParameter("rgb", t("Int"), undefined, "val"),
      ]),
      undefined,
      ["enum"],
      undefined,
      undefined,
      [
        entry("RED", "0xFF0000"),
        entry("GREEN", "0x00FF00"),
        entry("BLUE", "0x0000FF"),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "value-arguments.kt");
  });

  it("separates annotated entries with a blank line", async () => {
    const entry = (name: string, raw: string) =>
      f.createEnumEntry(
        name,
        [{ expression: f.createStringLiteral([{ text: raw }]) }],
        undefined,
        [
          f.createAnnotation("SerialName", [
            { expression: f.createStringLiteral([{ text: raw }]) },
          ]),
        ],
      );
    const node = f.createClassDeclaration(
      "Status",
      f.createPrimaryConstructor([
        f.createParameter("raw", f.createUserType("String"), undefined, "val"),
      ]),
      undefined,
      ["enum"],
      undefined,
      undefined,
      [entry("ACTIVE", "active"), entry("PENDING", "pending")],
    );
    await assertPrintedMatchesSnapshot(file([node]), "annotated-entries.kt");
  });
});
