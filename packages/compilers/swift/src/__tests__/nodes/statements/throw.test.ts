import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("throw statement", () => {
  it("inside a throwing function", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [],
        undefined,
        [
          swift.factory.createThrowStatement(
            swift.factory.createFunctionCallExpression(
              swift.factory.createIdentifier("CancellationError"),
              [],
            ),
          ),
        ],
        undefined,
        undefined,
        { throws: true },
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "throw.swift");
  });
});
