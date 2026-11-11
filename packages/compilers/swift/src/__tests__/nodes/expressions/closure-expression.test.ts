import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("closure expression", () => {
  it("with a parameter and a body", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          initializer: swift.factory.createClosureExpression(
            ["x"],
            [
              swift.factory.createExpressionStatement(
                swift.factory.createIdentifier("x"),
              ),
            ],
          ),
          pattern: "example",
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "closure-expression.swift");
  });

  it("capture list with weak self", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration("Worker", [
        swift.factory.createFunctionDeclaration("run", [], undefined, []),
        swift.factory.createFunctionDeclaration("schedule", [], undefined, [
          swift.factory.createVariableDeclaration("let", [
            {
              initializer: swift.factory.createClosureExpression(
                [],
                [
                  swift.factory.createExpressionStatement(
                    swift.factory.createFunctionCallExpression(
                      swift.factory.createMemberAccessExpression(
                        swift.factory.createPostfixOperatorExpression(
                          swift.factory.createSelfExpression(),
                          "?",
                        ),
                        "run",
                      ),
                      [],
                    ),
                  ),
                ],
                [{ name: "self", specifier: "weak" }],
              ),
              pattern: "c",
            },
          ]),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "capture-list-weak-self.swift");
  });
});
