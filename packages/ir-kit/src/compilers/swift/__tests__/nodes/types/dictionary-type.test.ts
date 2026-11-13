import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("dictionary type", () => {
  it("wraps key and value types in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createDictionaryType(
            swift.factory.createIdentifierType("String"),
            swift.factory.createIdentifierType("Int"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "dictionary-type.swift");
  });
});
