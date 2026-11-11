import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("optional pattern", () => {
  it("in a switch case", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "handle",
        [
          {
            firstName: "_",
            secondName: "value",
            type: swift.factory.createOptionalType(
              swift.factory.createIdentifierType("Int"),
            ),
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
                  swift.factory.createOptionalPattern(
                    swift.factory.createValueBindingPattern(
                      "let",
                      swift.factory.createIdentifierPattern("x"),
                    ),
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
