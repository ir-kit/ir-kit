import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

const fn = (
  name: string,
  expr: Parameters<typeof f.createFunctionDeclaration>[4],
  returnType?: Parameters<typeof f.createFunctionDeclaration>[2],
) => f.createFunctionDeclaration(name, [], returnType, undefined, expr);

describe("literal", () => {
  it("numeric literals", async () => {
    await assertPrintedMatchesSnapshot(
      file([
        fn("answer", f.createLiteral("42", "int")),
        fn("big", f.createLiteral("42L", "long")),
        fn("pi", f.createLiteral("3.14", "double")),
        fn("ratio", f.createLiteral("0.5f", "float")),
      ]),
      "numeric.kt",
    );
  });

  it("boolean, char and null", async () => {
    await assertPrintedMatchesSnapshot(
      file([
        fn("enabled", f.createLiteral("true", "boolean")),
        fn("grade", f.createLiteral("A", "char")),
        fn(
          "empty",
          f.createLiteral("null", "null"),
          f.createNullableType(f.createUserType("String")),
        ),
      ]),
      "scalar.kt",
    );
  });
});
