import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("class declaration", () => {
  it("generic", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration(
        "Box",
        [
          swift.factory.createVariableDeclaration("let", [
            {
              pattern: "value",
              typeAnnotation: swift.factory.createIdentifierType("T"),
            },
          ]),
        ],
        undefined,
        undefined,
        [{ name: "T" }],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "generic.swift");
  });

  it("with modifiers and inheritance", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration(
        "ViewController",
        [
          swift.factory.createVariableDeclaration("let", [
            {
              pattern: "title",
              typeAnnotation: swift.factory.createIdentifierType("String"),
            },
          ]),
        ],
        ["public", "final"],
        [swift.factory.createIdentifierType("UIViewController")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "with-modifiers-and-inheritance.swift",
    );
  });
});
