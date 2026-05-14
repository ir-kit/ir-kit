import { type Budgets, compileBudgets } from "./budgets.js";
import { FlowBuilder } from "./flow.js";
import type { Scenario } from "./pace.js";
import { type Middleware, makeStepCtx, setMiddleware } from "./runtime.js";

export interface ScenarioConfig {
  pace: Scenario;
  test?: () => unknown;
  flow?: FlowBuilder<unknown>;
  /** Per-scenario middleware. Inherits top-level `use` if omitted. */
  use?: ReadonlyArray<Middleware>;
}

export interface LoadTestConfig {
  /** Middleware applied to every scenario (auth, custom headers). */
  use?: ReadonlyArray<Middleware>;
  /** Pass/fail gates. Compiled to k6 thresholds. */
  budgets?: Budgets;
  /** Shorthand: single scenario with this pace + `test`/`flow`. */
  pace?: Scenario;
  test?: () => unknown;
  flow?: FlowBuilder<unknown>;
  /** Named scenarios — each becomes its own k6 exec function. */
  scenarios?: Record<string, ScenarioConfig>;
  /** k6 `setup()` — runs once before all VUs. */
  setup?: () => unknown;
  /** k6 `teardown(data)` — runs once after all VUs. */
  teardown?: (data: unknown) => void;
  /** Extra k6 options merged into the final options object. */
  options?: Record<string, unknown>;
}

export interface CompiledOptions {
  scenarios: Record<string, Scenario>;
  thresholds: Record<string, ReadonlyArray<string>>;
  [extra: string]: unknown;
}

export interface CompiledLoadTest {
  /** Assign to `export const options`. */
  options: CompiledOptions;
  /** Assign to `export default`. */
  default: () => void;
  /** Re-export by name so k6 can dispatch named scenarios: `export const { browse, write } = lt.scenarios;` */
  scenarios: Record<string, () => void>;
  setup?: () => unknown;
  teardown?: (data: unknown) => void;
}

/** Compile a load-test config into the static exports k6 expects. */
export function defineLoadTest(config: LoadTestConfig): CompiledLoadTest {
  setMiddleware(config.use ?? []);

  const thresholds = compileBudgets(config.budgets);
  const scenarios: Record<string, Scenario> = {};
  const execs: Record<string, () => void> = {};

  const hasNamed = config.scenarios && Object.keys(config.scenarios).length > 0;

  if (hasNamed) {
    for (const [name, sc] of Object.entries(config.scenarios!)) {
      scenarios[name] = { ...sc.pace, exec: name };
      execs[name] = buildExec(sc, config.use);
    }
  } else {
    if (!config.pace) {
      throw new Error("defineLoadTest: provide either `scenarios` or `pace`");
    }
    if (!config.test && !config.flow) {
      throw new Error(
        "defineLoadTest: provide either `test` or `flow` when using `pace`",
      );
    }
    scenarios.default = { ...config.pace, exec: "default" };
    execs.default = buildExec({
      pace: config.pace,
      test: config.test,
      flow: config.flow,
    });
  }

  const options: CompiledOptions = {
    ...(config.options ?? {}),
    scenarios,
    thresholds,
  };

  return {
    options,
    default: execs.default ?? Object.values(execs)[0],
    scenarios: execs,
    setup: config.setup,
    teardown: config.teardown,
  };
}

function buildExec(
  sc: ScenarioConfig,
  inherit?: ReadonlyArray<Middleware>,
): () => void {
  return () => {
    if (sc.use && sc.use.length) setMiddleware(sc.use);
    else if (inherit) setMiddleware(inherit);

    const ctx = makeStepCtx();
    if (sc.flow) sc.flow.run(ctx);
    else if (sc.test) sc.test();
  };
}
