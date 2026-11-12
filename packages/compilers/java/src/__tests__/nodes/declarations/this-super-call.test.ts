import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("this/super via call expression", () => {
  it("constructor delegation using this() call", async () => {
    const field = java.factory.createVariableDeclaration(
      "z",
      java.factory.createIdentifier("int"),
      undefined,
      ["private"],
    );

    const constructor1 = java.factory.createMethodDeclaration(
      "Point3D",
      [
        java.factory.createMethodParameter(
          "x",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "y",
          java.factory.createIdentifier("int"),
        ),
      ],
      undefined,
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createThisExpression(),
            [
              java.factory.createIdentifier("x"),
              java.factory.createIdentifier("y"),
              java.factory.createLiteral(0),
            ],
          ),
        ),
      ],
      ["public"],
    );

    const constructor2 = java.factory.createMethodDeclaration(
      "Point3D",
      [
        java.factory.createMethodParameter(
          "x",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "y",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "z",
          java.factory.createIdentifier("int"),
        ),
      ],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("z"),
          ),
          java.factory.createIdentifier("z"),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "Point3D",
      [field, constructor1, constructor2],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "this-super-call.java");
  });

  it("constructor with super() call and inheritance", async () => {
    const field = java.factory.createVariableDeclaration(
      "color",
      java.factory.createIdentifier("String"),
      undefined,
      ["private"],
    );

    const constructor = java.factory.createMethodDeclaration(
      "ColoredPoint",
      [
        java.factory.createMethodParameter(
          "x",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "y",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "color",
          java.factory.createIdentifier("String"),
        ),
      ],
      undefined,
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createSuperExpression(),
            [
              java.factory.createIdentifier("x"),
              java.factory.createIdentifier("y"),
            ],
          ),
        ),
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("color"),
          ),
          java.factory.createIdentifier("color"),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "ColoredPoint",
      [field, constructor],
      ["public"],
      undefined,
      java.factory.createIdentifier("Point"), // extends Point
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "super-call-inheritance.java");
  });

  it("method with this() call and method chaining", async () => {
    const field = java.factory.createVariableDeclaration(
      "value",
      java.factory.createIdentifier("String"),
      undefined,
      ["private"],
    );

    const constructor = java.factory.createMethodDeclaration(
      "Builder",
      [],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("value"),
          ),
          java.factory.createLiteral(""),
        ),
      ],
      ["public"],
    );

    const setValueMethod = java.factory.createMethodDeclaration(
      "setValue",
      [
        java.factory.createMethodParameter(
          "value",
          java.factory.createIdentifier("String"),
        ),
      ],
      java.factory.createIdentifier("Builder"),
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("value"),
          ),
          java.factory.createIdentifier("value"),
        ),
        java.factory.createReturnStatement(java.factory.createThisExpression()),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "Builder",
      [field, constructor, setValueMethod],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "this-method-chaining.java");
  });

  it("constructor with complex this() call arguments", async () => {
    const field1 = java.factory.createVariableDeclaration(
      "name",
      java.factory.createIdentifier("String"),
      undefined,
      ["private"],
    );

    const field2 = java.factory.createVariableDeclaration(
      "age",
      java.factory.createIdentifier("int"),
      undefined,
      ["private"],
    );

    const field3 = java.factory.createVariableDeclaration(
      "active",
      java.factory.createIdentifier("boolean"),
      undefined,
      ["private"],
    );

    const constructor1 = java.factory.createMethodDeclaration(
      "Person",
      [
        java.factory.createMethodParameter(
          "name",
          java.factory.createIdentifier("String"),
        ),
      ],
      undefined,
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createThisExpression(),
            [
              java.factory.createIdentifier("name"),
              java.factory.createLiteral(0),
              java.factory.createLiteral(true),
            ],
          ),
        ),
      ],
      ["public"],
    );

    const constructor2 = java.factory.createMethodDeclaration(
      "Person",
      [
        java.factory.createMethodParameter(
          "name",
          java.factory.createIdentifier("String"),
        ),
        java.factory.createMethodParameter(
          "age",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "active",
          java.factory.createIdentifier("boolean"),
        ),
      ],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("name"),
          ),
          java.factory.createIdentifier("name"),
        ),
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("age"),
          ),
          java.factory.createIdentifier("age"),
        ),
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("active"),
          ),
          java.factory.createIdentifier("active"),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "Person",
      [field1, field2, field3, constructor1, constructor2],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "complex-this-call.java");
  });

  it("constructor with super() call and field initialization", async () => {
    const field = java.factory.createVariableDeclaration(
      "type",
      java.factory.createIdentifier("String"),
      undefined,
      ["private"],
    );

    const constructor = java.factory.createMethodDeclaration(
      "SpecializedPoint",
      [
        java.factory.createMethodParameter(
          "x",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "y",
          java.factory.createIdentifier("int"),
        ),
        java.factory.createMethodParameter(
          "type",
          java.factory.createIdentifier("String"),
        ),
      ],
      undefined,
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createSuperExpression(),
            [
              java.factory.createIdentifier("x"),
              java.factory.createIdentifier("y"),
            ],
          ),
        ),
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("type"),
          ),
          java.factory.createIdentifier("type"),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "SpecializedPoint",
      [field, constructor],
      ["public"],
      undefined,
      java.factory.createIdentifier("Point"),
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "super-call-with-fields.java");
  });
});
