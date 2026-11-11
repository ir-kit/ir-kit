import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("variable declaration", () => {
  it("modifiers", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration("Counter", [
        swift.factory.createVariableDeclaration(
          "let",
          [
            {
              initializer: swift.factory.createIntegerLiteral("0"),
              pattern: "shared",
              typeAnnotation: swift.factory.createIdentifierType("Int"),
            },
          ],
          undefined,
          ["public", "static"],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "modifiers.swift");
  });
});
