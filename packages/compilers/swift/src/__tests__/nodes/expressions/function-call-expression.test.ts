import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("function call expression", () => {
  it("with labeled and unlabeled arguments", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createFunctionCallExpression(
            swift.factory.createIdentifier("greet"),
            [
              { expression: swift.factory.createStringLiteral("world") },
              {
                expression: swift.factory.createIntegerLiteral("2"),
                label: "times",
              },
            ],
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "function-call-expression.swift");
  });

  it("wraps arguments past the max line length", async () => {
    const f = swift.factory;
    const arg = (label: string) => ({
      label,
      expression: f.createMemberAccessExpression(
        f.createIdentifier("options"),
        label,
      ),
    });
    const file = f.createSourceFile([
      f.createFunctionDeclaration("send", [], undefined, [
        f.createReturnStatement(
          f.createTryExpression(
            f.createAwaitExpression(
              f.createFunctionCallExpression(
                f.createIdentifier("client.execute"),
                [
                  { expression: f.createIdentifier("request") },
                  arg("requestInterceptors"),
                  arg("responseValidator"),
                  arg("responseTransformer"),
                ],
              ),
            ),
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "call-wrapped-arguments.swift");
  });
});
