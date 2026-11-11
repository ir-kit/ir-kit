import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("source file", () => {
  it("simple", async () => {
    const file = swift.factory.createSourceFile([]);
    await assertPrintedMatchesSnapshot(file, "simple.swift");
  });
});
