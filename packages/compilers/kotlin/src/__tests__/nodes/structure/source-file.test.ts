import { kt } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("source file", () => {
  it("simple", async () => {
    const file = kt.factory.createSourceFile(
      [],
      kt.factory.createPackageHeader("com.example"),
    );
    await assertPrintedMatchesSnapshot(file, "simple.kt");
  });
});
