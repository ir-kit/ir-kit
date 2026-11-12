import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("expressions", () => {
  it("print println", async () => {
    const system = java.factory.createIdentifier("System");
    const out = java.factory.createIdentifier("out");
    const println = java.factory.createIdentifier("println");

    const systemOut = java.factory.createMemberExpression(system, out);
    const callTarget = java.factory.createMemberExpression(systemOut, println);
    const call = java.factory.createCallExpression(callTarget, [
      java.factory.createLiteral(1),
    ]);

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createExpressionStatement(call),
    ]);

    await assertPrintedMatchesSnapshot(file, "print.java");
  });
});
