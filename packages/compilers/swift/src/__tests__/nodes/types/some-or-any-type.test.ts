import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("some or any type", () => {
  it("wraps an existential any type in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createSomeOrAnyType(
            "any",
            swift.factory.createIdentifierType("Codable"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "any-type.swift");
  });

  it("wraps an opaque some type in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createSomeOrAnyType(
            "some",
            swift.factory.createIdentifierType("Equatable"),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "some-type.swift");
  });
});
