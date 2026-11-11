import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("is pattern", () => {
  it("in a switch case", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "handle",
        [
          {
            firstName: "_",
            secondName: "value",
            type: swift.factory.createIdentifierType("Any"),
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
                  swift.factory.createIsPattern(
                    swift.factory.createIdentifierType("Int"),
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
