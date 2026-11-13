import { $ } from "@hey-api/openapi-ts";
import type { WalkedOperation } from "@ir-kit/k6-gen";
import {
  defaultExportProp,
  namespaceImport,
  printModule,
  reExportConst,
} from "@ir-kit/k6-gen/ast";

import {
  type AuthFlavor,
  type AuthScaffoldOpts,
  authVarDecl,
  k6FrameworkImport,
} from "../loadtest-scaffold.js";
import { type Expr, objLit, varConst } from "./ast-helpers.js";
import { buildFlowExpression, type ChainMode } from "./chains.js";

export type PacePreset = "smoke" | "load" | "stress" | "spike" | "soak";

export interface ScaffoldScenarioOpts {
  /** Relative import path for the generated client (`./src/gen/index.js`). */
  clientImportPath: string;
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
  const auth = opts.auth && opts.auth.auth !== "none" ? opts.auth : undefined;
  if (auth) symbols.push("useAuth");

  return printModule({
    imports: [
      k6FrameworkImport(symbols),
      namespaceImport("api", opts.clientImportPath),
    ],
    nodes: [
      ...(auth ? [authVarDecl(auth)] : []),
      loadtestDecl(opts, !!auth),
      reExportConst("options", "lt", "options"),
    ],
    footer: defaultExportProp("lt", "default"),
  });
}

function loadtestDecl(opts: ScaffoldScenarioOpts, hasAuth: boolean) {
  const config = $.object().pretty();
  if (hasAuth) config.prop("use", $.array($("auth")));
  config
    .prop(
      "scenario",
      $(opts.pace).call(
        objLit({ duration: $.literal(opts.duration ?? "30s") }),
      ),
    )
    .prop("budgets", budgets(opts.budgets))
    .prop("flow", buildFlowExpression(opts.ops, opts.chain));
  return varConst("lt", $("defineLoadTest").call(config));
}

function budgets(budgets: ScaffoldScenarioOpts["budgets"]): Expr {
  const top: Record<string, Expr> = {
    p95: $.literal(budgets?.p95 ?? "500ms"),
    errors: $.literal(budgets?.errors ?? "1%"),
  };
  if (budgets?.p99) top.p99 = $.literal(budgets.p99);
  const opsEntries = Object.entries(budgets?.ops ?? {});
  if (opsEntries.length > 0) {
    top.ops = objLit(
      Object.fromEntries(opsEntries.map(([opId, b]) => [opId, opBudget(b)])),
      true,
    );
  }
  return objLit(top, true);
}

function opBudget(b: { p95?: string; p99?: string; errors?: string }): Expr {
  const props: Record<string, Expr> = {};
  if (b.p95) props.p95 = $.literal(b.p95);
  if (b.p99) props.p99 = $.literal(b.p99);
  if (b.errors) props.errors = $.literal(b.errors);
  return objLit(props);
}

export type { AuthFlavor };
