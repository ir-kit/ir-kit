import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("as expression", () => {
  it("forced cast", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createExpressionStatement(
        swift.factory.createAsExpression(
          swift.factory.createIdentifier("value"),
          swift.factory.createIdentifierType("String"),
          "!",
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "forced-cast.swift");
  });
});
