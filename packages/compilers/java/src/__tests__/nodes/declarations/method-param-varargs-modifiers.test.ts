import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("method parameters: varargs and modifiers", () => {
  it("basic varargs and parameter modifiers", async () => {
    const method = java.factory.createMethodDeclaration(
      "printf",
      [
        java.factory.createMethodParameter(
          "format",
          java.factory.createIdentifier("String"),
          ["final"],
        ),
        java.factory.createMethodParameter(
          "args",
          java.factory.createIdentifier("Object"),
          undefined,
          undefined,
          true,
        ),
      ],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "Printer",
      [method],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "method-param-varargs-mods.java");
  });

  it("method with multiple parameter modifiers", async () => {
    const method = java.factory.createMethodDeclaration(
      "processData",
      [
        java.factory.createMethodParameter(
          "input",
          java.factory.createIdentifier("String"),
          ["final"],
        ),
        java.factory.createMethodParameter(
          "count",
          java.factory.createIdentifier("int"),
          ["final"],
        ),
        java.factory.createMethodParameter(
          "options",
          java.factory.createArrayType(
            java.factory.createIdentifier("String"),
            1,
          ),
          undefined,
          undefined,
          true, // varargs
        ),
      ],
      java.factory.createIdentifier("void"),
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createMemberExpression(
                java.factory.createIdentifier("System"),
                java.factory.createIdentifier("out"),
              ),
              java.factory.createIdentifier("println"),
            ),
            [java.factory.createIdentifier("input")],
          ),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "DataProcessor",
      [method],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "multi-param-modifiers.java");
  });

  it("method with annotated parameters", async () => {
    const NotNullAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("NotNull"),
    );

    const SizeAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Size"),
      [
        { name: "min", value: java.factory.createLiteral(1) },
        { name: "max", value: java.factory.createLiteral(100) },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "validateAndProcess",
      [
        java.factory.createMethodParameter(
          "name",
          java.factory.createIdentifier("String"),
          ["final"],
          [NotNullAnnotation, SizeAnnotation],
        ),
        java.factory.createMethodParameter(
          "values",
          java.factory.createArrayType(
            java.factory.createIdentifier("Integer"),
            1,
          ),
          ["final"],
          [NotNullAnnotation],
          true, // varargs
        ),
      ],
      java.factory.createIdentifier("boolean"),
      [java.factory.createReturnStatement(java.factory.createLiteral(true))],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "Validator",
      [method],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotated-params.java");
  });

  it("method with complex parameter types and varargs", async () => {
    const method = java.factory.createMethodDeclaration(
      "processGenericData",
      [
        java.factory.createMethodParameter(
          "key",
          java.factory.createParameterizedType(
            java.factory.createIdentifier("Map"),
            [
              java.factory.createIdentifier("String"),
              java.factory.createIdentifier("Object"),
            ],
          ),
          ["final"],
        ),
        java.factory.createMethodParameter(
          "processors",
          java.factory.createArrayType(
            java.factory.createParameterizedType(
              java.factory.createIdentifier("Function"),
              [
                java.factory.createIdentifier("String"),
                java.factory.createIdentifier("String"),
              ],
            ),
            1,
          ),
          ["final"],
          undefined,
          true, // varargs
        ),
      ],
      java.factory.createIdentifier("void"),
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createMemberExpression(
                java.factory.createIdentifier("System"),
                java.factory.createIdentifier("out"),
              ),
              java.factory.createIdentifier("println"),
            ),
            [java.factory.createLiteral("Processing generic data")],
          ),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "GenericProcessor",
      [method],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "complex-param-types.java");
  });

  it("static method with varargs and parameter annotations", async () => {
    const SafeVarargsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("SafeVarargs"),
    );

    const SuppressWarningsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("SuppressWarnings"),
      [java.factory.createLiteral("unchecked")],
    );

    const method = java.factory.createMethodDeclaration(
      "safeVarargsMethod",
      [
        java.factory.createMethodParameter(
          "items",
          java.factory.createArrayType(
            java.factory.createIdentifier("Object"),
            1,
          ),
          ["final"],
          undefined,
          true, // varargs
        ),
      ],
      java.factory.createIdentifier("void"),
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createMemberExpression(
                java.factory.createIdentifier("System"),
                java.factory.createIdentifier("out"),
              ),
              java.factory.createIdentifier("println"),
            ),
            [java.factory.createLiteral("Safe varargs processing")],
          ),
        ),
      ],
      ["public", "static"],
      [SafeVarargsAnnotation, SuppressWarningsAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "SafeVarargsUtil",
      [method],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "safe-varargs-method.java");
  });

  it("constructor with varargs and parameter modifiers", async () => {
    const field = java.factory.createVariableDeclaration(
      "values",
      java.factory.createArrayType(java.factory.createIdentifier("String"), 1),
      undefined,
      ["private", "final"],
    );

    const constructor = java.factory.createMethodDeclaration(
      "VarargsConstructor",
      [
        java.factory.createMethodParameter(
          "name",
          java.factory.createIdentifier("String"),
          ["final"],
        ),
        java.factory.createMethodParameter(
          "values",
          java.factory.createArrayType(
            java.factory.createIdentifier("String"),
            1,
          ),
          ["final"],
          undefined,
          true, // varargs
        ),
      ],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier("values"),
          ),
          java.factory.createIdentifier("values"),
        ),
      ],
      ["public"],
    );

    const cls = java.factory.createClassDeclaration(
      "VarargsConstructor",
      [field, constructor],
      ["public"],
    );
    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "constructor-varargs.java");
  });
});
