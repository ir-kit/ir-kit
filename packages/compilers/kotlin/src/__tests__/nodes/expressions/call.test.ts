import { assertPrintedMatchesSnapshot, f, file, id } from "../utils.js";

describe("call expression", () => {
  it("plain arguments", async () => {
    const node = f.createFunctionDeclaration(
      "run",
      [],
      undefined,
      undefined,
      f.createCallExpression(id("compute"), [
        { expression: f.createLiteral("1", "int") },
        { expression: f.createLiteral("2", "int") },
      ]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "plain.kt");
  });

  it("named arguments", async () => {
    const node = f.createFunctionDeclaration(
      "user",
      [],
      undefined,
      undefined,
      f.createCallExpression(id("User"), [
        { expression: f.createLiteral("1", "int"), name: "id" },
        { expression: f.createStringLiteral([{ text: "Ada" }]), name: "name" },
      ]),
    );
    await assertPrintedMatchesSnapshot(file([node]), "named-arguments.kt");
  });

  it("trailing lambda", async () => {
    const node = f.createFunctionDeclaration(
      "list",
      [],
      undefined,
      undefined,
      f.createCallExpression(
        id("buildList"),
        undefined,
        undefined,
        f.createLambdaExpression([
          f.createExpressionStatement(
            f.createCallExpression(id("add"), [
              { expression: f.createLiteral("1", "int") },
            ]),
          ),
        ]),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), "trailing-lambda.kt");
  });

  it("wraps arguments past the max line length", async () => {
    const arg = (name: string) => ({
      expression: f.createNavigationExpression(
        f.createIdentifier("options"),
        f.createIdentifier(name),
      ),
      name,
    });
    const node = f.createFunctionDeclaration("send", [], undefined, [
      f.createReturnStatement(
        f.createCallExpression(f.createIdentifier("client.execute"), [
          { expression: f.createIdentifier("request") },
          arg("timeout"),
          arg("extraInterceptors"),
          arg("responseValidator"),
          arg("responseTransformer"),
        ]),
      ),
      f.createReturnStatement(f.createIdentifier("Unit")),
    ]);
    await assertPrintedMatchesSnapshot(file([node]), "call-wrapped-args.kt");
  });
});
