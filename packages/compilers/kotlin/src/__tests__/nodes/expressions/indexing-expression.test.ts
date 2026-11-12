import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

describe("indexing expression", () => {
  it("single index", async () => {
    const node = f.createFunctionDeclaration(
      "lookup",
      [
        f.createParameter(
          "map",
          f.createUserType("Map", [
            f.createUserType("String"),
            f.createUserType("String"),
          ]),
        ),
      ],
      f.createNullableType(f.createUserType("String")),
      undefined,
      f.createIndexingExpression(id("map"), [
        f.createStringLiteral([{ text: "key" }]),
      ]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "single-index.kt");
  });

  it("multiple indices", async () => {
    const node = f.createFunctionDeclaration(
      "cell",
      [
        f.createParameter("table", f.createUserType("Table")),
        f.createParameter("row", f.createUserType("Int")),
        f.createParameter("col", f.createUserType("Int")),
      ],
      undefined,
      undefined,
      f.createIndexingExpression(id("table"), [id("row"), id("col")]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "multiple-indices.kt");
  });
});
