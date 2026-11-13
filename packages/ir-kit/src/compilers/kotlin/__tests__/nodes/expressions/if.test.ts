import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const intParam = (name: string) =>
  f.createParameter(name, f.createUserType("Int"));

describe("if expression", () => {
  it("if else", async () => {
    const node = f.createFunctionDeclaration(
      "max",
      [intParam("a"), intParam("b")],
      f.createUserType("Int"),
      undefined,
      f.createIfExpression(
        f.createBinaryExpression(id("a"), ">", id("b")),
        id("a"),
        id("b"),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "if-else.kt");
  });

  it("branches with calls", async () => {
    const node = f.createFunctionDeclaration(
      "pick",
      [f.createParameter("flag", f.createUserType("Boolean"))],
      f.createUserType("String"),
      undefined,
      f.createIfExpression(
        id("flag"),
        f.createCallExpression(id("primary")),
        f.createCallExpression(id("fallback")),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "call-branches.kt");
  });
});
