import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("import declaration", () => {
  it("module", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration("Foundation"),
    ]);
    await assertPrintedMatchesSnapshot(file, "module.swift");
  });

  it("with import kind", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createImportDeclaration("Foundation.Data", "struct"),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-import-kind.swift");
  });
});
