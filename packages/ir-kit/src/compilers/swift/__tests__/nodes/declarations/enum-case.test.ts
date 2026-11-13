import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("enum case declaration", () => {
  it("with associated values", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration("Result", [
        swift.factory.createEnumCaseDeclaration([
          {
            name: "success",
            parameterClause: [swift.factory.createIdentifierType("Int")],
          },
        ]),
        swift.factory.createEnumCaseDeclaration([
          {
            name: "failure",
            parameterClause: [swift.factory.createIdentifierType("Error")],
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-associated-values.swift");
  });

  it("with raw value", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration(
        "Code",
        [
          swift.factory.createEnumCaseDeclaration([
            { name: "ok", rawValue: swift.factory.createIntegerLiteral("200") },
          ]),
        ],
        undefined,
        [swift.factory.createIdentifierType("Int")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-raw-value.swift");
  });
});
