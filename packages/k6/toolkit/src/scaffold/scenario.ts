import type { WalkedOperation } from "@ir-kit/k6-gen";
import ts from "typescript";

import { namespaceImport } from "../ast-imports.js";
import {
  type AuthFlavor,
  type AuthScaffoldOpts,
  authVarDecl,
  k6FrameworkImport,
} from "../loadtest-scaffold.js";
import { printStatements } from "../print.js";
import {
  defaultExportProp,
  objLit,
  reExportConst,
  varConst,
} from "./ast-helpers.js";
import { buildFlowExpression, type ChainMode } from "./chains.js";

const f = ts.factory;

export type PacePreset = "smoke" | "load" | "stress" | "spike" | "soak";

export interface ScaffoldScenarioOpts {
  /** Relative import path for the generated client (`./src/gen/index.js`). */
  clientImportPath: string;
  /** Pace preset selector. */
  pace: PacePreset;
  /** Duration string passed to the pace preset. Default `"30s"`. */
  duration?: string;
  /** Operations to compose into a flow. Empty → placeholder `flow().step("health", ...)`. */
  ops: ReadonlyArray<WalkedOperation>;
  /** How to compose the ops. */
  chain: ChainMode;
  /** Pass/fail thresholds. */
  budgets?: {
    p95?: string;
    p99?: string;
    errors?: string;
    /** Per-operation budgets keyed by operationId. */
    ops?: Record<string, { p95?: string; p99?: string; errors?: string }>;
  };
  /** Auth recipe. Omit / "none" → no auth. */
  auth?: AuthScaffoldOpts;
}

/** Render a complete standalone scenario `.ts` file as a string. */
export function scaffoldScenario(opts: ScaffoldScenarioOpts): string {
  const symbols = ["defineLoadTest", "flow", opts.pace];
  if (opts.chain === "batch" && opts.ops.length > 1) symbols.push("batch");
  if (opts.auth && opts.auth.auth !== "none") symbols.push("useAuth");

  const stmts: ts.Statement[] = [
    k6FrameworkImport(symbols),
    namespaceImport("api", opts.clientImportPath),
  ];

  const hasAuth = opts.auth && opts.auth.auth !== "none";
  if (hasAuth) stmts.push(authVarDecl(opts.auth!));

  stmts.push(loadtestDecl(opts, hasAuth ?? false));
  stmts.push(reExportConst("options", "lt", "options"));
  stmts.push(defaultExportProp("lt", "default"));

  return printStatements(stmts);
}

function loadtestDecl(
  opts: ScaffoldScenarioOpts,
  hasAuth: boolean,
): ts.Statement {
  const props: ts.PropertyAssignment[] = [];

  if (hasAuth) {
    props.push(
      f.createPropertyAssignment(
        "use",
        f.createArrayLiteralExpression([f.createIdentifier("auth")]),
      ),
    );
  }

  props.push(scenarioEntry(opts.pace, opts.duration ?? "30s"));
  props.push(budgetsEntry(opts.budgets));
  props.push(
    f.createPropertyAssignment(
      "flow",
      buildFlowExpression(opts.ops, opts.chain),
    ),
  );

  return varConst(
    "lt",
    f.createCallExpression(f.createIdentifier("defineLoadTest"), undefined, [
      f.createObjectLiteralExpression(props, true),
    ]),
  );
}

function scenarioEntry(
  pace: PacePreset,
  duration: string,
): ts.PropertyAssignment {
  return f.createPropertyAssignment(
    "scenario",
    f.createCallExpression(f.createIdentifier(pace), undefined, [
      objLit({ duration: f.createStringLiteral(duration) }),
    ]),
  );
}

function budgetsEntry(
  budgets: ScaffoldScenarioOpts["budgets"],
): ts.PropertyAssignment {
  const top: Record<string, ts.Expression> = {
    p95: f.createStringLiteral(budgets?.p95 ?? "500ms"),
    errors: f.createStringLiteral(budgets?.errors ?? "1%"),
  };
  if (budgets?.p99) top.p99 = f.createStringLiteral(budgets.p99);

  const opsEntries = Object.entries(budgets?.ops ?? {});
  if (opsEntries.length > 0) {
    top.ops = f.createObjectLiteralExpression(
      opsEntries.map(([opId, b]) =>
        f.createPropertyAssignment(opId, opBudgetObj(b)),
      ),
      true,
    );
  }

  return f.createPropertyAssignment("budgets", objLit(top, true));
}

function opBudgetObj(b: {
  p95?: string;
  p99?: string;
  errors?: string;
}): ts.Expression {
  const props: Record<string, ts.Expression> = {};
  if (b.p95) props.p95 = f.createStringLiteral(b.p95);
  if (b.p99) props.p99 = f.createStringLiteral(b.p99);
  if (b.errors) props.errors = f.createStringLiteral(b.errors);
  return objLit(props);
}

export type { AuthFlavor };
