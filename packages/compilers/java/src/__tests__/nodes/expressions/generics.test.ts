import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("generics", () => {
  it("parameterized types without TypeArgument wrapper", async () => {
    const setOfLong = java.factory.createParameterizedType(
      java.factory.createIdentifier("Set"),
      [java.factory.createIdentifier("Long")],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration("ids", setOfLong),
    ]);
    await assertPrintedMatchesSnapshot(file, "generics-no-typearg.java");
  });

  it("parameterized types and wildcards", async () => {
    const listOfString = java.factory.createParameterizedType(
      java.factory.createIdentifier("List"),
      [java.factory.createIdentifier("String")],
    );
    const listOfQExtends = java.factory.createParameterizedType(
      java.factory.createIdentifier("List"),
      [
        java.factory.createWildcardTypeArgument(
          "extends",
          java.factory.createIdentifier("Number"),
        ),
      ],
    );
    const mapType = java.factory.createParameterizedType(
      java.factory.createIdentifier("Map"),
      [java.factory.createIdentifier("String"), listOfQExtends],
    );

    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration("a", listOfString),
      java.factory.createVariableDeclaration("b", mapType),
    ]);
    await assertPrintedMatchesSnapshot(file, "generics.java");
  });

  it("wildcard super and unbounded wildcard", async () => {
    const listOfQSuper = java.factory.createParameterizedType(
      java.factory.createIdentifier("List"),
      [
        java.factory.createWildcardTypeArgument(
          "super",
          java.factory.createIdentifier("Number"),
        ),
      ],
    );
    const listOfQ = java.factory.createParameterizedType(
      java.factory.createIdentifier("List"),
      [java.factory.createWildcardTypeArgument()],
    );
    const file = java.factory.createSourceFile(undefined, [
      java.factory.createVariableDeclaration("c", listOfQSuper),
      java.factory.createVariableDeclaration("d", listOfQ),
    ]);
    await assertPrintedMatchesSnapshot(file, "generics-super.java");
  });
});
