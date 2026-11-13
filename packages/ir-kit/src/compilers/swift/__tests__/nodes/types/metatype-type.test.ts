import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("metatype type", () => {
  it("wraps a .Type metatype in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createMetatypeType(
            swift.factory.createIdentifierType("Int"),
            "Type",
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "metatype-type.swift");
  });

  it("wraps a .Protocol metatype in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createMetatypeType(
            swift.factory.createIdentifierType("Codable"),
            "Protocol",
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "metatype-type-protocol.swift");
  });
});
