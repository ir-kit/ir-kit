import { swift } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

describe("return statement", () => {
  it("inside a function with a return type", async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        "run",
        [],
        swift.factory.createIdentifierType("Int"),
        [
          swift.factory.createReturnStatement(
            swift.factory.createIntegerLiteral("0"),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, "return.swift");
  });
});
