import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("key path expression", () => {
  it("rooted key path", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration("Person", [
        swift.factory.createVariableDeclaration("let", [
          {
            pattern: "name",
            typeAnnotation: swift.factory.createIdentifierType("String"),
          },
        ]),
      ]),
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createKeyPathExpression(
            ["name"],
            swift.factory.createIdentifierType("Person"),
          ),
          pattern: "kp",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "rooted-key-path.swift");
  });
});
