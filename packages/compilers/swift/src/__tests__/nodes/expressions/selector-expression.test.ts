import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("selector expression", () => {
  it("selector for a method reference", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration("MyClass", [
        swift.factory.createFunctionDeclaration(
          "method",
          [],
          undefined,
          [],
          undefined,
          undefined,
          undefined,
          [{ attributeName: "objc" }],
        ),
      ]),
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createSelectorExpression(
            swift.factory.createMemberAccessExpression(
              swift.factory.createIdentifier("MyClass"),
              "method",
            ),
          ),
          pattern: "sel",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "selector-method-reference.swift");
  });
});
