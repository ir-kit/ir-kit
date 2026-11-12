import { assertPrintedMatchesSnapshot, f, file, id, t } from "../utils.js";

const call = (
  name: string,
  args: Parameters<typeof f.createCallExpression>[1] = [],
) => f.createCallExpression(id(name), args);

describe("parameter", () => {
  it("default values", async () => {
    const node = f.createFunctionDeclaration(
      "connect",
      [
        f.createParameter(
          "host",
          t("String"),
          f.createStringLiteral([{ text: "localhost" }]),
        ),
        f.createParameter("port", t("Int"), f.createLiteral("8080", "int")),
      ],
      undefined,
      [f.createExpressionStatement(call("open", [{ expression: id("host") }]))],
    );
    await assertPrintedMatchesSnapshot(file([node]), "default-values.kt");
  });

  it("vararg and nullable parameters", async () => {
    const node = f.createFunctionDeclaration(
      "log",
      [
        f.createParameter(
          "level",
          f.createNullableType(t("String")),
          f.createLiteral("null", "null"),
        ),
        f.createParameter("messages", t("String"), undefined, undefined, [
          "vararg",
        ]),
      ],
      undefined,
      [
        f.createExpressionStatement(
          call("emit", [{ expression: id("messages"), spread: true }]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), "vararg-nullable.kt");
  });
});
