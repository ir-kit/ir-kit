import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("protocol declaration", () => {
  it("with requirements and inheritance", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createProtocolDeclaration(
        "Greeter",
        [
          swift.factory.createFunctionDeclaration(
            "greet",
            [],
            swift.factory.createIdentifierType("String"),
          ),
        ],
        undefined,
        [swift.factory.createIdentifierType("Equatable")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "with-requirements-and-inheritance.swift",
    );
  });
});
