import ts from "typescript";

import { namedImport, namespaceImport } from "./ast-imports.js";
import { printStatements } from "./print.js";

export type AuthFlavor = "none" | "bearer";

export interface ScaffoldLoadtestOpts {
  /** Relative import path for the generated client. */
  clientImportPath: string;
  /** Auth recipe wired into `use: [...]`. */
  auth: AuthFlavor;
  /** Env var holding the bearer token. Only used when `auth === "bearer"`. */
  bearerEnv?: string;
  /** k6 pace preset. Default: `"smoke"`. */
  pace?: "smoke" | "load" | "stress" | "spike" | "soak";
  /** Duration string passed to the pace preset. Default: `"30s"`. */
  duration?: string;
}

const f = ts.factory;

/** Render a starter `loadtest.ts` via `ts.factory` — no template strings. */
export function scaffoldLoadtest(opts: ScaffoldLoadtestOpts): string {
  const stmts: ts.Statement[] = [
    k6FrameworkImport(opts.auth),
    namespaceImport("api", opts.clientImportPath),
  ];

  if (opts.auth === "bearer") {
    stmts.push(bearerAuthDecl(opts.bearerEnv ?? "API_TOKEN"));
  }

  stmts.push(loadtestDecl(opts));
  stmts.push(reExportConst("options", "lt", "options"));
  stmts.push(defaultExportProp("lt", "default"));

  return printStatements(stmts);
}

function k6FrameworkImport(auth: AuthFlavor): ts.ImportDeclaration {
  const names: Array<{ name: string }> = [
    { name: "defineLoadTest" },
    { name: "flow" },
    { name: "smoke" },
  ];
  if (auth === "bearer") names.push({ name: "useAuth" });
  return namedImport(names, "@ahmedrowaihi/k6");
}

function bearerAuthDecl(envVar: string): ts.Statement {
  // const auth = useAuth.bearer({ env: <envVar> });
  return varConst(
    "auth",
    f.createCallExpression(
      f.createPropertyAccessExpression(
        f.createIdentifier("useAuth"),
        f.createIdentifier("bearer"),
      ),
      undefined,
      [
        f.createObjectLiteralExpression(
          [f.createPropertyAssignment("env", f.createStringLiteral(envVar))],
          false,
        ),
      ],
    ),
  );
}

function loadtestDecl(opts: ScaffoldLoadtestOpts): ts.Statement {
  const pace = opts.pace ?? "smoke";
  const duration = opts.duration ?? "30s";

  const flowExpr = f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createCallExpression(f.createIdentifier("flow"), undefined, []),
      f.createIdentifier("step"),
    ),
    undefined,
    [
      f.createStringLiteral("health"),
      f.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        f.createBlock([], true),
      ),
    ],
  );

  const props: ts.PropertyAssignment[] = [];
  if (opts.auth === "bearer") {
    props.push(
      f.createPropertyAssignment(
        "use",
        f.createArrayLiteralExpression([f.createIdentifier("auth")], false),
      ),
    );
  }
  props.push(
    f.createPropertyAssignment(
      "pace",
      f.createCallExpression(f.createIdentifier(pace), undefined, [
        f.createObjectLiteralExpression(
          [
            f.createPropertyAssignment(
              "duration",
              f.createStringLiteral(duration),
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
    f.createPropertyAssignment("flow", flowExpr),
  );

  return varConst(
    "lt",
    f.createCallExpression(f.createIdentifier("defineLoadTest"), undefined, [
      f.createObjectLiteralExpression(props, true),
    ]),
  );
}

function varConst(name: string, init: ts.Expression): ts.Statement {
  return f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [f.createVariableDeclaration(name, undefined, undefined, init)],
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

function defaultExportProp(
  sourceVar: string,
  sourceProp: string,
): ts.Statement {
  return f.createExportAssignment(
    undefined,
    false,
    f.createPropertyAccessExpression(
      f.createIdentifier(sourceVar),
      f.createIdentifier(sourceProp),
    ),
  );
}
