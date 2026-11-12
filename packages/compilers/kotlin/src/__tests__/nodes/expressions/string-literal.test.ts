import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

describe("string literal", () => {
  it("identifier template", async () => {
    const node = f.createFunctionDeclaration(
      "greet",
      [f.createParameter("name", f.createUserType("String"))],
      undefined,
      undefined,
      f.createStringLiteral([{ text: "Hi, " }, { expression: id("name") }]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "template.kt");
  });

  it("expression interpolation", async () => {
    const node = f.createFunctionDeclaration(
      "total",
      [f.createParameter("price", f.createUserType("Int"))],
      undefined,
      undefined,
      f.createStringLiteral([
        { text: "Total: " },
        {
          expression: f.createBinaryExpression(
            id("price"),
            "*",
            f.createLiteral("2", "int"),
          ),
        },
      ]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "interpolation.kt");
  });

  it("multiline raw string", async () => {
    const node = f.createFunctionDeclaration(
      "payload",
      [],
      undefined,
      undefined,
      f.createStringLiteral([{ text: '{"status": "ok"}' }], true),
    );
    await assertPrintedMatchesSnapshot(file([node]), "multiline.kt");
  });
});
