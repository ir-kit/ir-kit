import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);

describe("block", () => {
  it("multi-statement block as loop body", async () => {
    const node = f.createFunctionDeclaration(
      "report",
      [
        f.createParameter(
          "items",
          f.createUserType("List", [f.createUserType("String")]),
        ),
      ],
      undefined,
      [
        f.createForStatement(
          ["item"],
          id("items"),
          f.createBlock([
            stmt(call("println", [{ expression: id("item") }])),
            stmt(call("log", [{ expression: id("item") }])),
          ]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "loop-body.kt");
  });

  it("nested blocks", async () => {
    const node = f.createFunctionDeclaration("loop", [], undefined, [
      f.createWhileStatement(
        id("running"),
        f.createBlock([
          f.createIfStatement(
            id("ready"),
            f.createBlock([stmt(call("handle"))]),
          ),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "nested.kt");
  });
});
