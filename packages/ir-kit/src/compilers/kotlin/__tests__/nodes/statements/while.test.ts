import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);

describe("while statement", () => {
  it("while loop", async () => {
    const node = f.createFunctionDeclaration("run", [], undefined, [
      f.createWhileStatement(id("active"), f.createBlock([stmt(call("tick"))])),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "while.kt");
  });

  it("do-while loop", async () => {
    const node = f.createFunctionDeclaration("poll", [], undefined, [
      f.createWhileStatement(
        id("active"),
        f.createBlock([stmt(call("tick"))]),
        true,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "do-while.kt");
  });
});
