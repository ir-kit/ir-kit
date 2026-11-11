import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("regex literal", () => {
  it("regex literal binding", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createRegexLiteral("[a-z]+"),
          pattern: "re",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "regex-literal-binding.swift");
  });
});
