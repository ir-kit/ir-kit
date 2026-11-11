import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("member access expression", () => {
  it("accesses a property on an identifier", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createMemberAccessExpression(
            swift.factory.createIdentifier("foo"),
            "bar",
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "member-access-expression.swift");
  });
});
