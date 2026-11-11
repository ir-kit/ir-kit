import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("expression pattern", () => {
  it("in a switch case", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "handle",
        [
          {
            firstName: "_",
            secondName: "value",
            type: swift.factory.createIdentifierType("Int"),
          },
        ],
        undefined,
        [
          swift.factory.createSwitchStatement(
            swift.factory.createIdentifier("value"),
            [
              swift.factory.createSwitchCase(
                [swift.factory.createReturnStatement()],
                [
                  swift.factory.createExpressionPattern(
                    swift.factory.createIntegerLiteral("0"),
                  ),
                ],
              ),
              swift.factory.createSwitchCase([
                swift.factory.createReturnStatement(),
              ]),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "in-a-switch-case.swift");
  });
});
