import { assertPrintedMatchesSnapshot, f, file, id, t } from "../utils.js";

describe("object declaration", () => {
  it("object with a property", async () => {
    const node = f.createObjectDeclaration("Config", [
      f.createProperty(
        "name",
        "val",
        t("String"),
        f.createStringLiteral([{ text: "api" }]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "singleton.kt");
  });

  it("companion object inside a class", async () => {
    const companion = f.createObjectDeclaration(
      undefined,
      [
        f.createProperty(
          "VERSION",
          "val",
          t("String"),
          f.createStringLiteral([{ text: "1.0" }]),
        ),
      ],
      undefined,
      undefined,
      undefined,
      true,
    );
    await assertPrintedMatchesSnapshot(
      file([f.createClassDeclaration("Client", undefined, [companion])]),
      "companion.kt",
    );
  });

  it("object implementing an interface", async () => {
    const node = f.createObjectDeclaration(
      "DefaultLogger",
      [
        f.createFunctionDeclaration(
          "log",
          [f.createParameter("message", t("String"))],
          undefined,
          [
            f.createExpressionStatement(
              f.createCallExpression(id("println"), [
                { expression: id("message") },
              ]),
            ),
          ],
          undefined,
          ["override"],
        ),
      ],
      undefined,
      undefined,
      [{ type: t("Logger") }],
    );
    await assertPrintedMatchesSnapshot(file([node]), "with-supertype.kt");
  });
});
