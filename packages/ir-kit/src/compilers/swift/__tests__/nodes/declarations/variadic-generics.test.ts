import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("variadic generics", () => {
  it("parameter pack with repeat each", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "tuple",
        [
          {
            firstName: "_",
            secondName: "items",
            type: swift.factory.createPackExpansionType(
              swift.factory.createPackElementType(
                swift.factory.createIdentifierType("T"),
              ),
            ),
          },
        ],
        swift.factory.createIdentifierType("Int"),
        [
          swift.factory.createReturnStatement(
            swift.factory.createIntegerLiteral("0"),
          ),
        ],
        undefined,
        [{ isPack: true, name: "T" }],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "parameter-pack.swift");
  });
});
