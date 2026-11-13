import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("interface declarations", () => {
  it("basic interface extending another interface", async () => {
    const i = java.factory.createInterfaceDeclaration(
      "Repository",
      [],
      ["public"],
      undefined,
      [java.factory.createIdentifier("Closeable")],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "interface.java");
  });

  it("data repository interface with constants and methods", async () => {
    const constant = java.factory.createVariableDeclaration(
      "MAX_CACHE_SIZE",
      java.factory.createIdentifier("int"),
      java.factory.createLiteral(1000),
      ["public", "static", "final"],
    );

    const saveMethod = java.factory.createMethodDeclaration(
      "save",
      [
        java.factory.createMethodParameter(
          "entity",
          java.factory.createIdentifier("Object"),
        ),
      ],
      java.factory.createIdentifier("void"),
      [], // interface methods have no body
      ["public"],
    );

    const findMethod = java.factory.createMethodDeclaration(
      "findById",
      [
        java.factory.createMethodParameter(
          "id",
          java.factory.createIdentifier("Long"),
        ),
      ],
      java.factory.createIdentifier("Object"),
      [], // interface methods have no body
      ["public"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "DataRepository",
      [constant, saveMethod, findMethod],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "interface-with-methods.java");
  });

  it("functional interface for string transformation", async () => {
    const FunctionalInterfaceAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("FunctionalInterface"),
    );

    const transformMethod = java.factory.createMethodDeclaration(
      "transform",
      [
        java.factory.createMethodParameter(
          "input",
          java.factory.createIdentifier("String"),
        ),
      ],
      java.factory.createIdentifier("String"),
      [], // interface methods have no body
      ["public"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "StringTransformer",
      [transformMethod],
      ["public"],
      [FunctionalInterfaceAnnotation],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "functional-interface.java");
  });

  it("file processor interface with default and static methods", async () => {
    const processMethod = java.factory.createMethodDeclaration(
      "process",
      [
        java.factory.createMethodParameter(
          "content",
          java.factory.createIdentifier("String"),
        ),
      ],
      java.factory.createIdentifier("String"),
      [], // interface methods have no body
      ["public"],
    );

    const defaultMethod = java.factory.createMethodDeclaration(
      "processWithValidation",
      [
        java.factory.createMethodParameter(
          "content",
          java.factory.createIdentifier("String"),
        ),
      ],
      java.factory.createIdentifier("String"),
      [
        java.factory.createReturnStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createThisExpression(),
              java.factory.createIdentifier("process"),
            ),
            [java.factory.createIdentifier("content")],
          ),
        ),
      ],
      ["public", "default"],
    );

    const staticMethod = java.factory.createMethodDeclaration(
      "getDefaultProcessor",
      [],
      java.factory.createIdentifier("FileProcessor"),
      [
        java.factory.createReturnStatement(
          java.factory.createLiteral("DefaultProcessor"),
        ),
      ],
      ["public", "static"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "FileProcessor",
      [processMethod, defaultMethod, staticMethod],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "interface-default-static.java");
  });

  it("file stream interface extending multiple interfaces", async () => {
    const readMethod = java.factory.createMethodDeclaration(
      "read",
      [],
      java.factory.createIdentifier("String"),
      [], // interface methods have no body
      ["public"],
    );

    const writeMethod = java.factory.createMethodDeclaration(
      "write",
      [
        java.factory.createMethodParameter(
          "data",
          java.factory.createIdentifier("String"),
        ),
      ],
      java.factory.createIdentifier("void"),
      [], // interface methods have no body
      ["public"],
    );

    const closeMethod = java.factory.createMethodDeclaration(
      "close",
      [],
      java.factory.createIdentifier("void"),
      [], // interface methods have no body
      ["public"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "FileStream",
      [readMethod, writeMethod, closeMethod],
      ["public"],
      undefined,
      [
        java.factory.createIdentifier("Readable"),
        java.factory.createIdentifier("Writable"),
        java.factory.createIdentifier("Closeable"),
      ],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "interface-multiple-extends.java");
  });

  it("generic comparator interface with type bounds", async () => {
    const T = java.factory.createTypeParameter("T", [
      java.factory.createIdentifier("Comparable"),
    ]);
    const U = java.factory.createTypeParameter("U", [
      java.factory.createIdentifier("Number"),
    ]);

    const compareMethod = java.factory.createMethodDeclaration(
      "compare",
      [
        java.factory.createMethodParameter(
          "first",
          java.factory.createIdentifier("T"),
        ),
        java.factory.createMethodParameter(
          "second",
          java.factory.createIdentifier("T"),
        ),
      ],
      java.factory.createIdentifier("int"),
      [], // interface methods have no body
      ["public"],
    );

    const calculateMethod = java.factory.createMethodDeclaration(
      "calculate",
      [
        java.factory.createMethodParameter(
          "value",
          java.factory.createIdentifier("U"),
        ),
      ],
      java.factory.createIdentifier("double"),
      [], // interface methods have no body
      ["public"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "GenericComparator",
      [compareMethod, calculateMethod],
      ["public"],
      undefined,
      undefined,
      false,
      [T, U],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "generic-interface.java");
  });

  it("deprecated legacy interface with annotations", async () => {
    const DeprecatedAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("Deprecated"),
    );

    const SuppressWarningsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier("SuppressWarnings"),
      [java.factory.createLiteral("unchecked")],
    );

    const legacyMethod = java.factory.createMethodDeclaration(
      "legacyMethod",
      [],
      java.factory.createIdentifier("void"),
      [], // interface methods have no body
      ["public"],
    );

    const i = java.factory.createInterfaceDeclaration(
      "LegacyInterface",
      [legacyMethod],
      ["public"],
      [DeprecatedAnnotation, SuppressWarningsAnnotation],
      undefined,
      false,
      undefined,
      ["// Legacy interface", "// Will be removed in future version"],
      ["// End of legacy interface"],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, "annotated-interface.java");
  });

  it("outer interface with nested static interface", async () => {
    const outerMethod = java.factory.createMethodDeclaration(
      "process",
      [],
      java.factory.createIdentifier("void"),
      [], // interface methods have no body
      ["public"],
    );

    const nestedInterface = java.factory.createInterfaceDeclaration(
      "InnerProcessor",
      [
        java.factory.createMethodDeclaration(
          "processInner",
          [],
          java.factory.createIdentifier("void"),
          [], // interface methods have no body
          ["public"],
        ),
      ],
      ["public", "static"],
    );

    const outerInterface = java.factory.createInterfaceDeclaration(
      "OuterProcessor",
      [outerMethod, nestedInterface],
      ["public"],
    );

    const file = java.factory.createSourceFile(undefined, [outerInterface]);
    await assertPrintedMatchesSnapshot(file, "nested-interface.java");
  });
});
