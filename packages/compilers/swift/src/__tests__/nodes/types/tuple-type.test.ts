import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("tuple type", () => {
  it("wraps unlabeled elements in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createTupleType([
            { type: swift.factory.createIdentifierType("Int") },
            { type: swift.factory.createIdentifierType("String") },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "tuple-type.swift");
  });

  it("wraps labeled elements in a binding annotation", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration("let", [
        {
          pattern: "value",
          typeAnnotation: swift.factory.createTupleType([
            { firstName: "x", type: swift.factory.createIdentifierType("Int") },
            { firstName: "y", type: swift.factory.createIdentifierType("Int") },
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "tuple-type-labeled.swift");
  });
});
