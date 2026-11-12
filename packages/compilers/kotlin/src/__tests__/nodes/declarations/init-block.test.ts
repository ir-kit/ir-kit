import { assertPrintedMatchesSnapshot, f, file, id, t } from "../utils.js";

const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);
const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);

describe("init block", () => {
  it("init block with a precondition", async () => {
    const node = f.createClassDeclaration(
      "Range",
      f.createPrimaryConstructor([
        f.createParameter("start", t("Int"), undefined, "val"),
      ]),
      [
        f.createInitBlock([
          stmt(
            call("require", [
              {
                expression: f.createBinaryExpression(
                  id("start"),
                  ">=",
                  f.createLiteral("0", "int"),
                ),
              },
            ]),
          ),
        ]),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "precondition.kt");
  });

  it("init block with multiple statements", async () => {
    const node = f.createClassDeclaration(
      "Config",
      f.createPrimaryConstructor([
        f.createParameter("raw", t("String"), undefined, "val"),
      ]),
      [
        f.createInitBlock([
          stmt(
            call("require", [
              {
                expression: f.createCallExpression(
                  f.createNavigationExpression(id("raw"), id("isNotEmpty")),
                ),
              },
            ]),
          ),
          stmt(call("println", [{ expression: id("raw") }])),
        ]),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "multiple-statements.kt");
  });
});
