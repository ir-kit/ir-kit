import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("actor declaration", () => {
  it("with stored property", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createActorDeclaration("Counter", [
        swift.factory.createVariableDeclaration("var", [
          {
            initializer: swift.factory.createIntegerLiteral("0"),
            pattern: "value",
            typeAnnotation: swift.factory.createIdentifierType("Int"),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-stored-property.swift");
  });
});
