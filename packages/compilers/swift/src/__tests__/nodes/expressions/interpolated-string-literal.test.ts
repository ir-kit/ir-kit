import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("interpolated string literal", () => {
  it("text and interpolation segments", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createStringLiteral("World"),
          pattern: "name",
        },
      ]),
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createInterpolatedStringLiteral([
            { content: "Hello " },
            { expression: swift.factory.createIdentifier("name") },
          ]),
          pattern: "s",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "text-and-interpolation.swift");
  });
});
