import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("break statement", () => {
  it("inside a while loop", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createWhileStatement(
          [swift.factory.createBooleanLiteral(true)],
          [swift.factory.createBreakStatement()],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "break.swift");
  });
});
