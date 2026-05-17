import type { Options, Scenario, Threshold } from "k6/options";

import { type Budgets, compileBudgets } from "./budgets.js";
import { FlowBuilder } from "./flow.js";
import {
  type Middleware,
  makeStepCtx,
  setBaseUrl,
  setMiddleware,
} from "./runtime.js";

export interface ScenarioConfig {
  pace: Scenario;
  test?: () => unknown;
  flow?: FlowBuilder<unknown>;
  /** Per-scenario middleware. Inherits top-level `use` if omitted. */
  use?: ReadonlyArray<Middleware>;
  /** Per-scenario BASE_URL override. Falls back to __ENV.BASE_URL → client default. */
  baseUrl?: string;
}

/** Loose shape of a k6 end-of-test summary — sufficient for `handleSummary` use. */
export type SummaryHandler = (data: unknown) => Record<string, unknown>;

export interface LoadTestConfig {
  /** Middleware applied to every scenario (auth, custom headers). */
  use?: ReadonlyArray<Middleware>;
  /** Pass/fail gates. Compiled to k6 thresholds; merged with `options.thresholds`. */
  budgets?: Budgets;
  /** Shorthand: single scenario with this pace + `test`/`flow`. */
  pace?: Scenario;
  test?: () => unknown;
  flow?: FlowBuilder<unknown>;
  /** Override BASE_URL for the single-scenario shorthand. */
  baseUrl?: string;
  /** Named scenarios — each becomes its own k6 exec function. */
  scenarios?: Record<string, ScenarioConfig>;
  /** k6 `setup()` — runs once before all VUs. */
  setup?: () => unknown;
  /** k6 `teardown(data)` — runs once after all VUs. */
  teardown?: (data: unknown) => void;
  /**
   * k6 `handleSummary(data)` — return `{ filename: content }` to control end-of-test output
   * (JUnit, custom JSON, etc.). https://k6.io/docs/results-output/end-of-test/custom-summary/
   */
  handleSummary?: SummaryHandler;
  /** Extra k6 options merged into the final options object. `thresholds` is union-merged with `budgets`. */
  options?: Partial<Options>;
}

export type CompiledOptions = Options & {
  scenarios: Record<string, Scenario>;
};

export interface CompiledLoadTest {
  /** Assign to `export const options`. */
  options: CompiledOptions;
  /** Assign to `export default`. */
  default: () => void;
  /** Re-export by name so k6 can dispatch named scenarios: `export const { browse, write } = lt.scenarios;` */
  scenarios: Record<string, () => void>;
  setup?: () => unknown;
  teardown?: (data: unknown) => void;
  handleSummary?: SummaryHandler;
}

/** Compile a load-test config into the static exports k6 expects. */
export function defineLoadTest(config: LoadTestConfig): CompiledLoadTest {
  setMiddleware(config.use ?? []);

  const { thresholds: userThresholds, ...passthroughOptions } =
    config.options ?? {};
  const thresholds = mergeThresholds(
    userThresholds,
    compileBudgets(config.budgets),
  );

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
      baseUrl: config.baseUrl,
    });
  }

  const options: CompiledOptions = {
    ...passthroughOptions,
    scenarios,
    thresholds,
  };

  return {
    options,
    default: execs.default ?? Object.values(execs)[0],
    scenarios: execs,
    setup: config.setup,
    teardown: config.teardown,
    handleSummary: config.handleSummary,
  };
}

/**
 * Union-merge two threshold maps per metric. If both define the same metric,
 * specs are concatenated (user-first, derived-after) so neither side is silently dropped.
 */
function mergeThresholds(
  user: Options["thresholds"] | undefined,
  derived: Record<string, ReadonlyArray<string>>,
): Record<string, Threshold[]> {
  const out: Record<string, Threshold[]> = {};
  for (const [k, v] of Object.entries(user ?? {})) {
    out[k] = Array.isArray(v) ? [...v] : [v];
  }
  for (const [k, v] of Object.entries(derived)) {
    out[k] = out[k] ? [...out[k], ...v] : [...v];
  }
  return out;
}

function buildExec(
  sc: ScenarioConfig,
  inherit?: ReadonlyArray<Middleware>,
): () => void {
  return () => {
    if (sc.use && sc.use.length) setMiddleware(sc.use);
    else if (inherit) setMiddleware(inherit);

    setBaseUrl(sc.baseUrl);

    const ctx = makeStepCtx();
    if (sc.flow) sc.flow.run(ctx);
    else if (sc.test) sc.test();
  };
}
