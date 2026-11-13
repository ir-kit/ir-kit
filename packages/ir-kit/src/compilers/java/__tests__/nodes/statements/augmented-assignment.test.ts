import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("augmented assignment", () => {
  it("a += 1; b <<= 2; c >>>= 3;", async () => {
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration(
        "a",
        java.factory.createIdentifier("int"),
        java.factory.createLiteral(0),
      ),
      java.factory.createVariableDeclaration(
        "b",
        java.factory.createIdentifier("int"),
        java.factory.createLiteral(1),
      ),
      java.factory.createVariableDeclaration(
        "c",
        java.factory.createIdentifier("int"),
        java.factory.createLiteral(2),
      ),
      java.factory.createAugmentedAssignment(
        java.factory.createIdentifier("a"),
        "+=",
        java.factory.createLiteral(1),
      ),
      java.factory.createAugmentedAssignment(
        java.factory.createIdentifier("b"),
        "<<=",
        java.factory.createLiteral(2),
      ),
      java.factory.createAugmentedAssignment(
        java.factory.createIdentifier("c"),
        ">>>=",
        java.factory.createLiteral(3),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "augmented-assignment.java");
  });
});
