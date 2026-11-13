import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("optional type", () => {
  it("wraps a type in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createOptionalType(
            swift.factory.createIdentifierType("Int"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "optional-type.swift");
  });
});
