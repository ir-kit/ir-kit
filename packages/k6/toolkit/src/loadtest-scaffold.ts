import ts from "typescript";

import { namedImport, namespaceImport } from "./ast-imports.js";
import { printStatements } from "./print.js";
import {
  defaultExportProp,
  objLit,
  reExportConst,
  varConst,
} from "./scaffold/ast-helpers.js";

export type AuthFlavor = "none" | "bearer" | "basic" | "apiKey" | "session";

export interface ScaffoldLoadtestOpts {
  /** Relative import path for the generated client. */
  clientImportPath: string;
  /** Auth recipe wired into `use: [...]`. */
  auth: AuthFlavor;
  /** Env var holding the bearer token (only for `auth === "bearer"`). */
  bearerEnv?: string;
  /** Header name for the API key (only for `auth === "apiKey"`). */
  apiKeyHeader?: string;
  /** Env var holding the API key (only for `auth === "apiKey"`). */
  apiKeyEnv?: string;
  /** k6 pace preset. Default: `"smoke"`. */
  pace?: "smoke" | "load" | "stress" | "spike" | "soak";
  /** Duration string passed to the pace preset. Default: `"30s"`. */
  duration?: string;
  /**
   * Names for the `scenarios: { … }` block. When non-empty, the
   * scaffold uses the multi-scenario shape (each gets its own pace +
   * flow). When omitted/empty, falls back to the single-pace shape.
   */
  scenarios?: ReadonlyArray<string>;
  /**
   * Operation to seed the first flow step with. When set, the scaffold
   * emits `api.<name>()` instead of an empty placeholder so new devs
   * see a real call out of the box.
   */
  seedOperation?: string;
}

const f = ts.factory;

/** Render a starter `loadtest.ts` via `ts.factory` — no template strings. */
export function scaffoldLoadtest(opts: ScaffoldLoadtestOpts): string {
  const pace = opts.pace ?? "smoke";
  const symbols = ["defineLoadTest", "flow", pace];
  if (opts.auth !== "none") symbols.push("useAuth");

  const stmts: ts.Statement[] = [
    k6FrameworkImport(symbols),
    namespaceImport("api", opts.clientImportPath),
  ];

  if (opts.auth !== "none") stmts.push(authVarDecl(opts));

  stmts.push(loadtestDecl(opts, pace));
  stmts.push(reExportConst("options", "lt", "options"));
  stmts.push(defaultExportProp("lt", "default"));

  return printStatements(stmts);
}

/**
 * Compose the `import { defineLoadTest, flow, smoke, useAuth, batch?, ... }
 * from "@ahmedrowaihi/k6"` line. Shared across both `scaffoldLoadtest` and
 * `scaffoldScenario`. The caller chooses which framework symbols to add.
 */
export function k6FrameworkImport(
  symbols: ReadonlyArray<string>,
): ts.ImportDeclaration {
  return namedImport(
    Array.from(new Set(symbols)).map((name) => ({ name })),
    "@ahmedrowaihi/k6",
  );
}

/** `const auth = useAuth.<flavor>({ … });` */
export function authVarDecl(opts: AuthScaffoldOpts): ts.Statement {
  return varConst("auth", authCallExpr(opts));
}

/** Subset of opts needed to build an auth decl. */
export interface AuthScaffoldOpts {
  auth: AuthFlavor;
  bearerEnv?: string;
  apiKeyHeader?: string;
  apiKeyEnv?: string;
}

function authCallExpr(opts: AuthScaffoldOpts): ts.Expression {
  const useAuth = f.createIdentifier("useAuth");
  switch (opts.auth) {
    case "bearer":
      return useAuthCall(useAuth, "bearer", [
        objLit({ env: f.createStringLiteral(opts.bearerEnv ?? "API_TOKEN") }),
      ]);
    case "basic":
      return useAuthCall(useAuth, "basic", [
        objLit({
          user: objLit({ env: f.createStringLiteral("API_USER") }),
          pass: objLit({ env: f.createStringLiteral("API_PASS") }),
        }),
      ]);
    case "apiKey":
      return useAuthCall(useAuth, "apiKey", [
        objLit({
          name: f.createStringLiteral(opts.apiKeyHeader ?? "X-API-Key"),
          env: f.createStringLiteral(opts.apiKeyEnv ?? "API_KEY"),
        }),
      ]);
    case "session":
      return useAuthCall(useAuth, "session", [
        objLit({
          signIn: f.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            f.createBlock(
              [
                f.createReturnStatement(
                  f.createStringLiteral("/* obtain session cookie */"),
                ),
              ],
              true,
            ),
          ),
        }),
      ]);
    default:
      throw new Error(`Unknown auth flavor: ${opts.auth as string}`);
  }
}

function useAuthCall(
  useAuth: ts.Identifier,
  fn: string,
  args: ts.Expression[],
): ts.Expression {
  return f.createCallExpression(
    f.createPropertyAccessExpression(useAuth, f.createIdentifier(fn)),
    undefined,
    args,
  );
}

function loadtestDecl(
  opts: ScaffoldLoadtestOpts,
  pace: NonNullable<ScaffoldLoadtestOpts["pace"]>,
): ts.Statement {
  const duration = opts.duration ?? "30s";
  const props: ts.PropertyAssignment[] = [];

  if (opts.auth !== "none") props.push(useEntry());

  if (opts.scenarios && opts.scenarios.length > 0) {
    props.push(
      scenariosEntry(opts.scenarios, pace, duration, opts.seedOperation),
    );
  } else {
    props.push(
      paceEntry(pace, duration),
      budgetsEntry(),
      flowEntry(opts.seedOperation),
    );
  }

  return varConst(
    "lt",
    f.createCallExpression(f.createIdentifier("defineLoadTest"), undefined, [
      f.createObjectLiteralExpression(props, true),
    ]),
  );
}

function useEntry(): ts.PropertyAssignment {
  return f.createPropertyAssignment(
    "use",
    f.createArrayLiteralExpression([f.createIdentifier("auth")], false),
  );
}

function paceEntry(
  pace: NonNullable<ScaffoldLoadtestOpts["pace"]>,
  duration: string,
): ts.PropertyAssignment {
  return f.createPropertyAssignment(
    "scenario",
    f.createCallExpression(f.createIdentifier(pace), undefined, [
      objLit({ duration: f.createStringLiteral(duration) }),
    ]),
  );
}

function budgetsEntry(): ts.PropertyAssignment {
  return f.createPropertyAssignment(
    "budgets",
    objLit(
      {
        p95: f.createStringLiteral("500ms"),
        errors: f.createStringLiteral("1%"),
      },
      /* multiline */ true,
    ),
  );
}

function flowEntry(seedOp?: string): ts.PropertyAssignment {
  return f.createPropertyAssignment("flow", flowExpr(seedOp));
}

function flowExpr(seedOp?: string): ts.Expression {
  const stepLabel = seedOp ?? "health";
  return f.createCallExpression(
    f.createPropertyAccessExpression(
      f.createCallExpression(f.createIdentifier("flow"), undefined, []),
      f.createIdentifier("step"),
    ),
    undefined,
    [
      f.createStringLiteral(stepLabel),
      f.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        f.createBlock(seedOp ? [seededCallStatement(seedOp)] : [], true),
      ),
    ],
  );
}

function seededCallStatement(opName: string): ts.Statement {
  return f.createExpressionStatement(
    f.createCallExpression(
      f.createPropertyAccessExpression(
        f.createIdentifier("api"),
        f.createIdentifier(opName),
      ),
      undefined,
      [],
    ),
  );
}

function scenariosEntry(
  names: ReadonlyArray<string>,
  pace: NonNullable<ScaffoldLoadtestOpts["pace"]>,
  duration: string,
  seedOp?: string,
): ts.PropertyAssignment {
  const scenarioObj = f.createObjectLiteralExpression(
    names.map((name) =>
      f.createPropertyAssignment(
        name,
        objLit(
          {
            scenario: f.createCallExpression(
              f.createIdentifier(pace),
              undefined,
              [objLit({ duration: f.createStringLiteral(duration) })],
            ),
            flow: flowExpr(seedOp),
          },
          true,
        ),
      ),
    ),
    true,
  );
  return f.createPropertyAssignment("scenarios", scenarioObj);
}
