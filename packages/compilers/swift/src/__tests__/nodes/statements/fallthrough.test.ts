import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("fallthrough statement", () => {
  it("inside a switch case", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [
          {
            firstName: "value",
            type: swift.factory.createIdentifierType("Int"),
          },
        ],
        undefined,
        [
          swift.factory.createSwitchStatement(
            swift.factory.createIdentifier("value"),
            [
              swift.factory.createSwitchCase(
                [swift.factory.createFallthroughStatement()],
                [
                  swift.factory.createExpressionPattern(
                    swift.factory.createIntegerLiteral("0"),
                  ),
                ],
              ),
              swift.factory.createSwitchCase([
                swift.factory.createExpressionStatement(
                  swift.factory.createFunctionCallExpression(
                    swift.factory.createIdentifier("print"),
                    [
                      {
                        expression: swift.factory.createStringLiteral("other"),
                      },
                    ],
                  ),
                ),
              ]),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "fallthrough.swift");
  });
});
