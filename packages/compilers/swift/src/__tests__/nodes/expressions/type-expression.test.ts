import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

const f = swift.factory;

describe("type and implicit member expressions", () => {
  it("prints types in expression position and implicit members", async () => {
    const file = f.createSourceFile([
      f.createVariableDeclaration("let", [
        {
          initializer: f.createFunctionCallExpression(
            f.createTypeExpression(
              f.createArrayType(f.createIdentifierType("Int")),
            ),
            [],
          ),
          pattern: "items",
        },
      ]),
      f.createVariableDeclaration("let", [
        {
          initializer: f.createMemberAccessExpression(
            f.createTypeExpression(f.createIdentifierType("Pet")),
            "self",
          ),
          pattern: "petType",
        },
      ]),
      f.createVariableDeclaration("let", [
        {
          initializer: f.createImplicitMemberExpression("available"),
          pattern: "status",
          typeAnnotation: f.createIdentifierType("Status"),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "type-expression.swift");
  });
});
