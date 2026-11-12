import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("nil literal expression", () => {
  it("bound to an optional constant", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createNilLiteral(),
          pattern: "example",
          typeAnnotation: swift.factory.createOptionalType(
            swift.factory.createIdentifierType("Int"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "nil-literal.swift");
  });
});
