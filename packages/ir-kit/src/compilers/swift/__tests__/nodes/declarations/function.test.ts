import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("function declaration", () => {
  it("with parameters and return", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "add",
        [
          {
            firstName: "_",
            secondName: "a",
            type: swift.factory.createIdentifierType("Int"),
          },
          {
            firstName: "_",
            secondName: "b",
            type: swift.factory.createIdentifierType("Int"),
          },
        ],
        swift.factory.createIdentifierType("Int"),
        [
          swift.factory.createReturnStatement(
            swift.factory.createInfixOperatorExpression(
              swift.factory.createIdentifier("a"),
              "+",
              swift.factory.createIdentifier("b"),
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "with-parameters-and-return.swift",
    );
  });

  it("generic async throws", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "fetch",
        [
          {
            firstName: "_",
            secondName: "value",
            type: swift.factory.createIdentifierType("T"),
          },
        ],
        swift.factory.createIdentifierType("T"),
        [
          swift.factory.createReturnStatement(
            swift.factory.createIdentifier("value"),
          ),
        ],
        ["public"],
        [{ name: "T" }],
        { async: true, throws: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "generic-async-throws.swift");
  });

  it("wraps parameters past the max line length", async () => {
    const param = (name: string) => ({
      firstName: name,
      type: swift.factory.createOptionalType(
        swift.factory.createIdentifierType("String"),
      ),
      defaultValue: swift.factory.createNilLiteral(),
    });
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "updatePetWithForm",
        [param("petId"), param("name"), param("status"), param("category")],
        swift.factory.createIdentifierType("Pet"),
        [swift.factory.createReturnStatement(swift.factory.createNilLiteral())],
        ["public"],
        undefined,
        { async: true, throws: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "wrapped-parameters.swift");
  });
});
