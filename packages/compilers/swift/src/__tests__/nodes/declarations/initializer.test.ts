import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("initializer declaration", () => {
  it("inside struct", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createStructDeclaration("Point", [
        swift.factory.createVariableDeclaration("let", [
          {
            pattern: "x",
            typeAnnotation: swift.factory.createIdentifierType("Int"),
          },
        ]),
        swift.factory.createInitializerDeclaration(
          [{ firstName: "x", type: swift.factory.createIdentifierType("Int") }],
          [
            swift.factory.createExpressionStatement(
              swift.factory.createAssignmentExpression(
                swift.factory.createMemberAccessExpression(
                  swift.factory.createIdentifier("self"),
                  "x",
                ),
                swift.factory.createIdentifier("x"),
              ),
            ),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "inside-struct.swift");
  });

  it("failable inside class", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration("Wrapper", [
        swift.factory.createInitializerDeclaration(
          [
            {
              firstName: "value",
              type: swift.factory.createIdentifierType("Int"),
            },
          ],
          [
            swift.factory.createReturnStatement(
              swift.factory.createNilLiteral(),
            ),
          ],
          true,
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "failable-inside-class.swift");
  });
});
