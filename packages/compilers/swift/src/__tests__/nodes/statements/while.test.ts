import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("while statement", () => {
  it("with a break inside the loop body", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createWhileStatement(
          [swift.factory.createBooleanLiteral(true)],
          [swift.factory.createBreakStatement()],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "while.swift");
  });
});
