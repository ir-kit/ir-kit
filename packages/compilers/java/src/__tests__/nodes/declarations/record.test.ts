import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("record declarations", () => {
  it("record with annotated components and a method", async () => {
    const f = java.factory;
    const rec = f.createRecordDeclaration(
      "Pet",
      [
        f.createMethodParameter("id", f.createIdentifier("long")),
        f.createMethodParameter(
          "name",
          f.createIdentifier("String"),
          undefined,
          [
            f.createAnnotation(f.createIdentifier("JsonProperty"), [
              f.createLiteral("pet_name"),
            ]),
          ],
        ),
      ],
      [
        f.createMethodDeclaration(
          "label",
          [],
          f.createIdentifier("String"),
          [f.createReturnStatement(f.createIdentifier("name"))],
          ["public"],
        ),
      ],
      ["public"],
    );
    await assertPrintedMatchesSnapshot(
      java.factory.createSourceFile(undefined, [rec]),
      "record.java",
    );
  });

  it("empty record", async () => {
    const f = java.factory;
    const rec = f.createRecordDeclaration("Empty", [], [], ["public"]);
    await assertPrintedMatchesSnapshot(
      java.factory.createSourceFile(undefined, [rec]),
      "empty-record.java",
    );
  });
});
