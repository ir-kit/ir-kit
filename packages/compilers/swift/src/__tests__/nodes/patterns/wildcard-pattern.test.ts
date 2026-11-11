import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("wildcard pattern", () => {
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
                [swift.factory.createWildcardPattern()],
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "in-a-switch-case.swift");
  });
});
