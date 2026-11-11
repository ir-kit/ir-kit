import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);
const str = (text: string) => f.createStringLiteral([{ text }]);

describe("expression statement", () => {
  it("call statements", async () => {
    const node = f.createFunctionDeclaration("main", [], undefined, [
      f.createExpressionStatement(
        call("println", [{ expression: str("start") }]),
      ),
      f.createExpressionStatement(call("doWork")),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "calls.kt");
  });
});
