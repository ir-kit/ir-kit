import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("macro expansion expression", () => {
  it("freestanding macro with argument", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createMacroExpansionExpression("URL", [
            { expression: swift.factory.createStringLiteral("https://x.com") },
          ]),
          pattern: "u",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "freestanding-macro.swift");
  });
});
