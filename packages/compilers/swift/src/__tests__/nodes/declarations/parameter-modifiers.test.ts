import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("parameter modifiers", () => {
  it("inout parameter", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "increment",
        [
          {
            firstName: "_",
            isInout: true,
            secondName: "value",
            type: swift.factory.createIdentifierType("Int"),
          },
        ],
        undefined,
        [
          swift.factory.createExpressionStatement(
            swift.factory.createInfixOperatorExpression(
              swift.factory.createIdentifier("value"),
              "+=",
              swift.factory.createIntegerLiteral("1"),
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "inout-parameter.swift");
  });

  it("variadic parameter", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "sum",
        [
          {
            firstName: "_",
            isVariadic: true,
            secondName: "numbers",
            type: swift.factory.createIdentifierType("Int"),
          },
        ],
        swift.factory.createIdentifierType("Int"),
        [
          swift.factory.createReturnStatement(
            swift.factory.createIntegerLiteral("0"),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "variadic-parameter.swift");
  });
});
