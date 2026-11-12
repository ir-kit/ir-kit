import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);
const str = (text: string) => f.createStringLiteral([{ text }]);

describe("return statement", () => {
  it("return a value after a statement", async () => {
    const node = f.createFunctionDeclaration(
      "sum",
      [
        f.createParameter("a", f.createUserType("Int")),
        f.createParameter("b", f.createUserType("Int")),
      ],
      f.createUserType("Int"),
      [
        stmt(call("log", [{ expression: str("summing") }])),
        f.createReturnStatement(
          f.createBinaryExpression(id("a"), "+", id("b")),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "value.kt");
  });

  it("bare return without value", async () => {
    const node = f.createFunctionDeclaration(
      "notify",
      [f.createParameter("enabled", f.createUserType("Boolean"))],
      undefined,
      [
        f.createIfStatement(
          f.createPrefixUnaryExpression("!", id("enabled")),
          f.createReturnStatement(),
        ),
        stmt(call("send")),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "unit.kt");
  });
});
