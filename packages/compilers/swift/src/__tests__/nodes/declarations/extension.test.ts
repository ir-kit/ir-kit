import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("extension declaration", () => {
  it("with method", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createExtensionDeclaration(
        swift.factory.createIdentifierType("String"),
        [
          swift.factory.createFunctionDeclaration(
            "shout",
            [],
            swift.factory.createIdentifierType("String"),
            [
              swift.factory.createReturnStatement(
                swift.factory.createIdentifier("self"),
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-method.swift");
  });

  it("with conformance", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createExtensionDeclaration(
        swift.factory.createIdentifierType("Int"),
        [
          swift.factory.createVariableDeclaration("var", [
            {
              initializer: swift.factory.createBooleanLiteral(true),
              pattern: "isPositive",
              typeAnnotation: swift.factory.createIdentifierType("Bool"),
            },
          ]),
        ],
        undefined,
        [swift.factory.createIdentifierType("CustomStringConvertible")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-conformance.swift");
  });
});
