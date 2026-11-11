import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("range expression", () => {
  it("half-open range", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createRangeExpression(
            "..<",
            swift.factory.createIntegerLiteral("0"),
            swift.factory.createIntegerLiteral("10"),
          ),
          pattern: "r",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "half-open-range.swift");
  });

  it("closed range", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createRangeExpression(
            "...",
            swift.factory.createIntegerLiteral("1"),
            swift.factory.createIntegerLiteral("5"),
          ),
          pattern: "r",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "closed-range.swift");
  });
});
