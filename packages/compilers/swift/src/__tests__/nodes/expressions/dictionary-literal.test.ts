import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("dictionary literal expression", () => {
  it("bound to a constant", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createDictionaryLiteral([
            {
              key: swift.factory.createStringLiteral("a"),
              value: swift.factory.createIntegerLiteral("1"),
            },
            {
              key: swift.factory.createStringLiteral("b"),
              value: swift.factory.createIntegerLiteral("2"),
            },
          ]),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "dictionary-literal.swift");
  });
});
