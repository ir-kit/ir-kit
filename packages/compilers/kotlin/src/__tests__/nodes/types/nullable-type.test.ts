import { assertPrintedMatchesSnapshot, f, file } from "../utils.js";

describe("NullableType", () => {
  it("nullable simple and generic types", async () => {
    const maybeString = f.createTypeAlias(
      "MaybeString",
      f.createNullableType(f.createUserType("String")),
    );
    const maybeList = f.createTypeAlias(
      "MaybeList",
      f.createNullableType(f.createUserType("List", [f.createUserType("Int")])),
    );
    await assertPrintedMatchesSnapshot(
      file([maybeString, maybeList]),
      "simple-and-generic.kt",
    );
  });

  it("nullable function type wraps in parentheses", async () => {
    const handler = f.createTypeAlias(
      "Handler",
      f.createNullableType(f.createFunctionType([], f.createUserType("Unit"))),
    );
    await assertPrintedMatchesSnapshot(file([handler]), "function-type.kt");
  });

  it("does not nest an already nullable type", () => {
    const maybe = f.createNullableType(f.createUserType("String"));
    expect(f.createNullableType(maybe)).toBe(maybe);
  });
});
