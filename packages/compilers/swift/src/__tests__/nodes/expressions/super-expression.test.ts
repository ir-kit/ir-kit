import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("super expression", () => {
  it("member access on super inside a subclass method", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration("Base", [
        swift.factory.createVariableDeclaration("let", [
          {
            initializer: swift.factory.createIntegerLiteral("0"),
            pattern: "value",
            typeAnnotation: swift.factory.createIdentifierType("Int"),
          },
        ]),
      ]),
      swift.factory.createClassDeclaration(
        "Derived",
        [
          swift.factory.createFunctionDeclaration("read", [], undefined, [
            swift.factory.createVariableDeclaration("let", [
              {
                initializer: swift.factory.createMemberAccessExpression(
                  swift.factory.createSuperExpression(),
                  "value",
                ),
                pattern: "x",
              },
            ]),
          ]),
        ],
        undefined,
        [swift.factory.createIdentifierType("Base")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "super-member-access.swift");
  });
});
