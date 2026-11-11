import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("array type", () => {
  it("wraps an element type in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createArrayType(
            swift.factory.createIdentifierType("Int"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "array-type.swift");
  });
});
