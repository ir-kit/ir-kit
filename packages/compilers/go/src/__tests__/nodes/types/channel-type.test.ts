import { go } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("channel type", () => {
  it("bidirectional", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createImportStatement("fmt"),
      go.factory.createFunctionDeclaration(
        undefined,
        "main",
        undefined,
        undefined,
        undefined,
        [
          go.factory.createVariableStatement(
            undefined,
            go.factory.createVariableDeclarationList(
              [
                go.factory.createVariableDeclaration(
                  "ch",
                  go.factory.createChannelType(
                    go.factory.createIdentifier("int"),
                  ),
                ),
              ],
              go.NodeFlags.Var,
            ),
          ),
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier("fmt"),
                go.factory.createIdentifier("Println"),
              ),
              [go.factory.createIdentifier("ch")],
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "bidirectional.go");
  });

  it("directional parameters", async () => {
    const file = go.factory.createSourceFile("main", [
      go.factory.createFunctionDeclaration(
        undefined,
        "worker",
        undefined,
        [
          go.factory.createFunctionParameter(
            ["jobs"],
            go.factory.createChannelType(
              go.factory.createIdentifier("int"),
              "receive",
            ),
          ),
          go.factory.createFunctionParameter(
            ["results"],
            go.factory.createChannelType(
              go.factory.createIdentifier("int"),
              "send",
            ),
          ),
        ],
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "directional-parameters.go");
  });
});
