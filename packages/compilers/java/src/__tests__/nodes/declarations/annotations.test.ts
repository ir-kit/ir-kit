import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("annotations", () => {
  it("class and method and param and field annotations", async () => {
    const Override = java.factory.createAnnotation(
      java.factory.createIdentifier("Override"),
    );
    const NotNull = java.factory.createAnnotation(
      java.factory.createIdentifier("NotNull"),
    );
    const Size = java.factory.createAnnotation(
      java.factory.createIdentifier("Size"),
      [
        { name: "min", value: java.factory.createLiteral(3) },
        { name: "max", value: java.factory.createLiteral(10) },
      ],
    );
    const Author = java.factory.createAnnotation(
      java.factory.createIdentifier("Author"),
      [java.factory.createLiteral("me")],
    );

    const method = java.factory.createMethodDeclaration(
      "greet",
      [
        java.factory.createMethodParameter(
          "name",
          java.factory.createIdentifier("String"),
          [],
          [NotNull, Size],
        ),
      ],
      java.factory.createIdentifier("void"),
      [
        java.factory.createVariableDeclaration(
          "msg",
          java.factory.createIdentifier("String"),
          java.factory.createLiteral("hi"),
          [],
          [Author],
        ),
      ],
      ["public"],
      [Override],
    );

    const cls = java.factory.createClassDeclaration(
      "Greeter",
      [method],
      ["public"],
      [],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotations.java");
  });

  it("annotation type declaration", async () => {
    const members = [
      (() => {
        const m = java.factory.createMethodDeclaration(
          "value",
          [],
          java.factory.createIdentifier("String"),
          [],
        );
        return m;
      })(),
      (() => {
        const m = java.factory.createMethodDeclaration(
          "flag",
          [],
          java.factory.createIdentifier("boolean"),
          [],
          undefined,
          undefined,
          undefined,
          undefined,
          java.factory.createLiteral(true),
        );
        return m;
      })(),
    ];
    const annType = java.factory.createInterfaceDeclaration(
      "MyAnno",
      members,
      ["public"],
      [],
      [],
      true,
    );
    const file = java.factory.createSourceFile(undefined, [annType]);
    await assertPrintedMatchesSnapshot(file, "annotationType.java");
  });

  it("annotation with multiple values", async () => {
    const TestAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Test"),
      [
        { name: "name", value: java.factory.createLiteral("testMethod") },
        { name: "timeout", value: java.factory.createLiteral(5000) },
        { name: "expected", value: java.factory.createIdentifier("Exception") },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "testMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [TestAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "TestClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-multiple-values.java");
  });

  it("annotation with array values", async () => {
    const AuthorsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Authors"),
      [
        {
          name: "value",
          value: java.factory.createArrayInitializer([
            java.factory.createLiteral("John"),
            java.factory.createLiteral("Jane"),
            java.factory.createLiteral("Bob"),
          ]),
        },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "collaborativeMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [AuthorsAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "CollaborativeClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-array-values.java");
  });

  it("annotation with nested annotations", async () => {
    const NestedAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Nested"),
      [{ name: "value", value: java.factory.createLiteral("nested value") }],
    );

    const OuterAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Outer"),
      [
        { name: "nested", value: NestedAnnotation },
        { name: "count", value: java.factory.createLiteral(42) },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "nestedAnnotationMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [OuterAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "NestedAnnotationClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "nested-annotations.java");
  });

  it("annotation with enum values", async () => {
    const PriorityAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Priority"),
      [
        {
          name: "level",
          value: java.factory.createMemberExpression(
            java.factory.createIdentifier("Priority"),
            java.factory.createIdentifier("HIGH"),
          ),
        },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "highPriorityMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [PriorityAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "PriorityClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-enum-values.java");
  });

  it("annotation with class values", async () => {
    const ComponentAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Component"),
      [
        {
          name: "type",
          value: java.factory.createMemberExpression(
            java.factory.createIdentifier("ComponentType"),
            java.factory.createIdentifier("SERVICE"),
          ),
        },
        {
          name: "interfaces",
          value: java.factory.createArrayInitializer([
            java.factory.createIdentifier("Runnable"),
            java.factory.createIdentifier("Serializable"),
          ]),
        },
      ],
    );

    const cls = java.factory.createClassDeclaration(
      "ServiceClass",
      [],
      ["public"],
      [ComponentAnnotation],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-class-values.java");
  });

  it("annotation type with complex elements", async () => {
    const valueElement = java.factory.createMethodDeclaration(
      "value",
      [],
      java.factory.createIdentifier("String"),
      [],
    );

    const countElement = java.factory.createMethodDeclaration(
      "count",
      [],
      java.factory.createIdentifier("int"),
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      java.factory.createLiteral(1),
    );

    const enabledElement = java.factory.createMethodDeclaration(
      "enabled",
      [],
      java.factory.createIdentifier("boolean"),
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      java.factory.createLiteral(true),
    );

    const tagsElement = java.factory.createMethodDeclaration(
      "tags",
      [],
      java.factory.createArrayType(java.factory.createIdentifier("String"), 1),
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      java.factory.createArrayInitializer([]),
    );

    const annType = java.factory.createInterfaceDeclaration(
      "ComplexAnnotation",
      [valueElement, countElement, enabledElement, tagsElement],
      ["public"],
      [],
      [],
      true,
    );

    const file = java.factory.createSourceFile(undefined, [annType]);
    await assertPrintedMatchesSnapshot(file, "complex-annotation-type.java");
  });

  it("annotation with single value (shorthand)", async () => {
    const ValueAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Value"),
      [java.factory.createLiteral("single value")],
    );

    const method = java.factory.createMethodDeclaration(
      "singleValueMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [ValueAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "SingleValueClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-single-value.java");
  });

  it("multiple annotations on same element", async () => {
    const DeprecatedAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Deprecated"),
    );

    const SuppressWarningsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("SuppressWarnings"),
      [java.factory.createLiteral("unchecked")],
    );

    const OverrideAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Override"),
    );

    const method = java.factory.createMethodDeclaration(
      "legacyMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [DeprecatedAnnotation, SuppressWarningsAnnotation, OverrideAnnotation],
    );

    const cls = java.factory.createClassDeclaration(
      "LegacyClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "multiple-annotations.java");
  });

  it("annotation with comments", async () => {
    const CustomAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Custom"),
      [
        {
          name: "description",
          value: java.factory.createLiteral("Custom annotation"),
        },
      ],
    );

    const method = java.factory.createMethodDeclaration(
      "annotatedMethod",
      [],
      java.factory.createIdentifier("void"),
      [],
      ["public"],
      [CustomAnnotation],
      undefined,
      undefined,
      undefined,
      ["Method with custom annotation", "This demonstrates annotation usage"],
      ["End of annotated method"],
    );

    const cls = java.factory.createClassDeclaration(
      "AnnotatedClass",
      [method],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, "annotation-with-comments.java");
  });
});
