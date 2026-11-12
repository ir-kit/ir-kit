import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("repeat-while statement", () => {
  it("with a body and a trailing condition", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createRepeatWhileStatement(
          [
            swift.factory.createExpressionStatement(
              swift.factory.createFunctionCallExpression(
                swift.factory.createIdentifier("print"),
                [{ expression: swift.factory.createStringLiteral("tick") }],
              ),
            ),
          ],
          swift.factory.createBooleanLiteral(false),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "repeat-while.swift");
  });
});
