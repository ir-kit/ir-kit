import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("enum declaration", () => {
  it("with cases", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration("Direction", [
        swift.factory.createEnumCaseDeclaration([{ name: "north" }]),
        swift.factory.createEnumCaseDeclaration([{ name: "south" }]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, "with-cases.swift");
  });

  it("with raw value inheritance", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createEnumDeclaration(
        "Status",
        [
          swift.factory.createEnumCaseDeclaration([
            {
              name: "active",
              rawValue: swift.factory.createStringLiteral("active"),
            },
          ]),
        ],
        undefined,
        [swift.factory.createIdentifierType("String")],
      ),
    ]);
    await assertPrintedMatchesSnapshot(
      file,
      "with-raw-value-inheritance.swift",
    );
  });
});
