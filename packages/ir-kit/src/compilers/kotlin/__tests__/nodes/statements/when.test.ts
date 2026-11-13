import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);
const str = (text: string) => f.createStringLiteral([{ text }]);

describe("when statement", () => {
  it("when with subject", async () => {
    const node = f.createFunctionDeclaration(
      "describe",
      [f.createParameter("n", f.createUserType("Int"))],
      undefined,
      [
        stmt(call("log", [{ expression: id("n") }])),
        f.createWhenStatement(
          [
            {
              body: stmt(call("println", [{ expression: str("zero") }])),
              conditions: [f.createLiteral("0", "int")],
            },
            {
              body: stmt(call("println", [{ expression: str("one") }])),
              conditions: [f.createLiteral("1", "int")],
            },
            { body: stmt(call("println", [{ expression: str("other") }])) },
          ],
          id("n"),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "subject.kt");
  });

  it("when without subject", async () => {
    const node = f.createFunctionDeclaration(
      "grade",
      [f.createParameter("score", f.createUserType("Int"))],
      undefined,
      [
        stmt(call("log", [{ expression: id("score") }])),
        f.createWhenStatement([
          {
            body: stmt(call("println", [{ expression: str("A") }])),
            conditions: [
              f.createBinaryExpression(
                id("score"),
                ">=",
                f.createLiteral("90", "int"),
              ),
            ],
          },
          {
            body: stmt(call("println", [{ expression: str("B") }])),
            conditions: [
              f.createBinaryExpression(
                id("score"),
                ">=",
                f.createLiteral("80", "int"),
              ),
            ],
          },
          { body: stmt(call("println", [{ expression: str("F") }])) },
        ]),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "no-subject.kt");
  });
});
