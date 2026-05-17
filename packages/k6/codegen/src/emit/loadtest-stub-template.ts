import ts from "typescript";

import { GENERATED_HEADER, printStatements } from "../print.js";
import { namedImport, namespaceImport } from "./ast-imports.js";

export interface LoadtestStubInput {
  fnName: string;
  summary: string;
  clientImport: string;
  dataImport: string;
  callArgs: ReadonlyArray<ts.Expression>;
}

const f = ts.factory;

export function renderLoadtestStub(input: LoadtestStubInput): string {
  const header = `${GENERATED_HEADER}\n//\n// Stub loadtest for \`${input.fnName}\` — ${input.summary}.\n// Fill in pace, budgets, and assertions. Safe to edit.`;

  return printStatements(
    [
      namedImport(
        [{ name: "defineLoadTest" }, { name: "flow" }, { name: "smoke" }],
        "@ahmedrowaihi/k6",
      ),
      namespaceImport("api", input.clientImport),
      namedImport([{ name: "data" }], input.dataImport),
      defineLoadTestConst(input),
      reExportConst("options", "lt", "options"),
      defaultExport("lt", "default"),
    ],
    header,
  );
}

function defineLoadTestConst(input: LoadtestStubInput): ts.Statement {
  const stepBody = f.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    f.createBlock(
      [
        f.createExpressionStatement(
          f.createCallExpression(
            f.createPropertyAccessExpression(
              f.createIdentifier("api"),
              f.createIdentifier(input.fnName),
            ),
            undefined,
            input.callArgs as ts.Expression[],
          ),
        ),
      ],
      true,
    ),
  );

  const flowChain = f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createCallExpression(f.createIdentifier("flow"), undefined, []),
      f.createIdentifier("step"),
    ),
    undefined,
    [f.createStringLiteral(input.fnName), stepBody],
  );

  const ltConfig = f.createObjectLiteralExpression(
    [
      f.createPropertyAssignment(
        "scenario",
        f.createCallExpression(f.createIdentifier("smoke"), undefined, [
          f.createObjectLiteralExpression(
            [
              f.createPropertyAssignment(
                "duration",
                f.createStringLiteral("30s"),
              ),
            ],
            false,
          ),
        ]),
      ),
      f.createPropertyAssignment(
        "budgets",
        f.createObjectLiteralExpression(
          [
            f.createPropertyAssignment("p95", f.createStringLiteral("500ms")),
            f.createPropertyAssignment("errors", f.createStringLiteral("1%")),
          ],
          true,
        ),
      ),
      f.createPropertyAssignment("flow", flowChain),
    ],
    true,
  );

  return f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          "lt",
          undefined,
          undefined,
          f.createCallExpression(
            f.createIdentifier("defineLoadTest"),
            undefined,
            [ltConfig],
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}

function reExportConst(
  localName: string,
  sourceVar: string,
  sourceProp: string,
): ts.Statement {
  return f.createVariableStatement(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          localName,
          undefined,
          undefined,
          f.createPropertyAccessExpression(
            f.createIdentifier(sourceVar),
            f.createIdentifier(sourceProp),
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}

function defaultExport(sourceVar: string, sourceProp: string): ts.Statement {
  return f.createExportAssignment(
    undefined,
    false,
    f.createPropertyAccessExpression(
      f.createIdentifier(sourceVar),
      f.createIdentifier(sourceProp),
    ),
  );
}
