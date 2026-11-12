import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("conditional compilation", () => {
  it("an #if/#else block inside a function", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration("run", [], undefined, [
        swift.factory.createConditionalCompilation(
          "DEBUG",
          [
            swift.factory.createExpressionStatement(
              swift.factory.createFunctionCallExpression(
                swift.factory.createIdentifier("print"),
                [{ expression: swift.factory.createStringLiteral("d") }],
              ),
            ),
          ],
          [
            swift.factory.createExpressionStatement(
              swift.factory.createFunctionCallExpression(
                swift.factory.createIdentifier("print"),
                [{ expression: swift.factory.createStringLiteral("r") }],
              ),
            ),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "conditional-compilation.swift");
  });
});
