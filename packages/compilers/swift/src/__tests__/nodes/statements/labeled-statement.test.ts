import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("labeled statement", () => {
  it("a labeled for loop that breaks to its label", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [
          {
            firstName: "items",
            type: swift.factory.createArrayType(
              swift.factory.createIdentifierType("Int"),
            ),
          },
        ],
        undefined,
        [
          swift.factory.createLabeledStatement(
            "outer",
            swift.factory.createForInStatement(
              "item",
              swift.factory.createIdentifier("items"),
              [swift.factory.createBreakStatement("outer")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "labeled-statement.swift");
  });
});
