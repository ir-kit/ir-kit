import { $, type TsDsl } from "@hey-api/openapi-ts";
import {
  defaultExportProp,
  type ModuleImport,
  namedImport,
  namespaceImport,
  printModule,
  reExportConst,
} from "@ir-kit/k6-gen/ast";

import { type Expr, objLit, varConst } from "./scaffold/ast-helpers.js";

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

/** Render a starter `loadtest.ts` via `ts.factory` — no template strings. */
export function scaffoldLoadtest(opts: ScaffoldLoadtestOpts): string {
  const pace = opts.pace ?? "smoke";
  const symbols = ["defineLoadTest", "flow", pace];
  if (opts.auth !== "none") symbols.push("useAuth");

  return printModule({
    imports: [
      k6FrameworkImport(symbols),
      namespaceImport("api", opts.clientImportPath),
    ],
    nodes: [
      ...(opts.auth !== "none" ? [authVarDecl(opts)] : []),
      loadtestDecl(opts, pace),
      reExportConst("options", "lt", "options"),
    ],
    footer: defaultExportProp("lt", "default"),
  });
}

/** `import { … } from "@ir-kit/k6";` with duplicate names removed. */
export function k6FrameworkImport(
  symbols: ReadonlyArray<string>,
): ModuleImport {
  return namedImport(Array.from(new Set(symbols)), "@ir-kit/k6");
}

/** `const auth = useAuth.<flavor>(…);` */
export function authVarDecl(opts: AuthScaffoldOpts): TsDsl {
  return varConst("auth", authCall(opts));
}

export interface AuthScaffoldOpts {
  auth: AuthFlavor;
  bearerEnv?: string;
  apiKeyHeader?: string;
  apiKeyEnv?: string;
}

function authCall(opts: AuthScaffoldOpts): Expr {
  const useAuth = (fn: string, arg: Expr) => $("useAuth").attr(fn).call(arg);
  switch (opts.auth) {
    case "bearer":
      return useAuth(
        "bearer",
        objLit({ env: $.literal(opts.bearerEnv ?? "API_TOKEN") }),
      );
    case "basic":
      return useAuth(
        "basic",
        objLit({
          user: objLit({ env: $.literal("API_USER") }),
          pass: objLit({ env: $.literal("API_PASS") }),
        }),
      );
    case "apiKey":
      return useAuth(
        "apiKey",
        objLit({
          name: $.literal(opts.apiKeyHeader ?? "X-API-Key"),
          env: $.literal(opts.apiKeyEnv ?? "API_KEY"),
        }),
      );
    case "session":
      return useAuth(
        "session",
        objLit({
          signIn: $.func().do(
            $.return($.literal("/* obtain session cookie */")),
          ),
        }),
      );
    default:
      throw new Error(`Unknown auth flavor: ${opts.auth as string}`);
  }
}

function loadtestDecl(
  opts: ScaffoldLoadtestOpts,
  pace: NonNullable<ScaffoldLoadtestOpts["pace"]>,
) {
  const duration = opts.duration ?? "30s";
  const config = $.object().pretty();
  if (opts.auth !== "none") config.prop("use", $.array($("auth")));
  if (opts.scenarios && opts.scenarios.length > 0) {
    const scenarios = $.object().pretty();
    for (const name of opts.scenarios) {
      scenarios.prop(
        name,
        objLit(
          {
            scenario: paceCall(pace, duration),
            flow: flowExpr(opts.seedOperation),
          },
          true,
        ),
      );
    }
    config.prop("scenarios", scenarios);
  } else {
    config
      .prop("scenario", paceCall(pace, duration))
      .prop(
        "budgets",
        objLit({ p95: $.literal("500ms"), errors: $.literal("1%") }, true),
      )
      .prop("flow", flowExpr(opts.seedOperation));
  }
  return varConst("lt", $("defineLoadTest").call(config));
}

function paceCall(pace: string, duration: string): Expr {
  return $(pace).call(objLit({ duration: $.literal(duration) }));
}

/** `flow().step("<seedOp|health>", () => { api.<seedOp>(); })` */
function flowExpr(seedOp?: string): Expr {
  const body = $.func();
  if (seedOp) body.do($.stmt($("api").attr(seedOp).call()));
  return $("flow")
    .call()
    .attr("step")
    .call($.literal(seedOp ?? "health"), body);
}
