import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const str = (text: string) => f.createStringLiteral([{ text }]);

describe("when expression", () => {
  it("with subject", async () => {
    const node = f.createFunctionDeclaration(
      "label",
      [f.createParameter("code", f.createUserType("Int"))],
      f.createUserType("String"),
      undefined,
      f.createWhenExpression(
        [
          { body: str("ok"), conditions: [f.createLiteral("200", "int")] },
          { body: str("missing"), conditions: [f.createLiteral("404", "int")] },
          { body: str("unknown") },
        ],
        id("code"),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "with-subject.kt");
  });

  it("without subject", async () => {
    const node = f.createFunctionDeclaration(
      "tier",
      [f.createParameter("score", f.createUserType("Int"))],
      f.createUserType("String"),
      undefined,
      f.createWhenExpression([
        {
          body: str("high"),
          conditions: [
            f.createBinaryExpression(
              id("score"),
              ">",
              f.createLiteral("90", "int"),
            ),
          ],
        },
        { body: str("low") },
      ]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "without-subject.kt");
  });
});
