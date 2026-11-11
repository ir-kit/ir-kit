import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("multiline string literal", () => {
  it("bound to a property", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createMultilineStringLiteral([
            "Line one",
            "Line two",
          ]),
          pattern: "doc",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "bound-to-property.swift");
  });
});
