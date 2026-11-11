import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("struct modifiers and inheritance", () => {
  it("public struct conforming to protocol", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration(
        "Point",
        [
          swift.factory.createVariableDeclaration("let", [
            {
              pattern: "x",
              typeAnnotation: swift.factory.createIdentifierType("Int"),
            },
          ]),
          swift.factory.createVariableDeclaration("let", [
            {
              pattern: "y",
              typeAnnotation: swift.factory.createIdentifierType("Int"),
            },
          ]),
        ],
        ["public"],
        [swift.factory.createIdentifierType("Codable")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "public-struct-conforming-to-protocol.swift",
    );
  });
});
