import ts from "typescript";

import { GENERATED_HEADER, printStatements } from "../print.js";
import {
  defaultExportProp,
  namedImport,
  namespaceImport,
  reExportConst,
} from "./ast.js";

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
        "@ir-kit/k6",
      ),
      namespaceImport("api", input.clientImport),
      namedImport([{ name: "data" }], input.dataImport),
      defineLoadTestConst(input),
      reExportConst("options", "lt", "options"),
      defaultExportProp("lt", "default"),
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
