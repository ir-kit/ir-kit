import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("source file import separation", () => {
  it("blank line after imports", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration("Foundation"),
      swift.factory.createStructDeclaration("User", [
        swift.factory.createVariableDeclaration("let", [
          {
            pattern: "id",
            typeAnnotation: swift.factory.createIdentifierType("Int"),
          },
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "blank-line-after-imports.swift");
  });
});
