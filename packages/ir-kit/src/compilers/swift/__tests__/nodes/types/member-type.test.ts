import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("member type", () => {
  it("wraps a qualified member type in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createMemberType(
            swift.factory.createIdentifierType("Swift"),
            "Int",
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "member-type.swift");
  });
});
