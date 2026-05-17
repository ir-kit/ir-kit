import type { Options, Scenario, Threshold } from "k6/options";

import { type Budgets, compileBudgets } from "./budgets.js";
import { FlowBuilder } from "./flow.js";
import {
  type Ctx,
  type MetricInstance,
  type MetricKind,
  type Middleware,
  makeCtx,
  metricsFactory,
  setBaseUrl,
  setMiddleware,
} from "./runtime.js";

export type { MetricInstance, MetricKind } from "./runtime.js";

/** Per-scenario binding: which Scenario to run, with which flow/test, under which auth. */
export interface ScenarioBinding<VuState = unknown> {
  /** The k6 `Scenario` literal (use a `pace.ts` preset or write a raw `Scenario`). */
  scenario: Scenario;
  test?: (ctx: Ctx<VuState>) => unknown;
  flow?: FlowBuilder<unknown, VuState>;
  /** Per-scenario middleware. Inherits top-level `use` if omitted. */
  use?: ReadonlyArray<Middleware>;
  /** Per-scenario BASE_URL override. Falls back to __ENV.BASE_URL → client default. */
  baseUrl?: string;
}

/** Loose shape of a k6 end-of-test summary — sufficient for `handleSummary` use. */
export type SummaryHandler = (data: unknown) => Record<string, unknown>;

/** Declarative custom-metric shape. Compiled to k6/metrics instances at startup. */
export interface MetricsSpec {
  [name: string]: MetricKind;
}

export type MetricsHandle<S extends MetricsSpec> = {
  [K in keyof S]: MetricInstance;
};

export interface LoadTestConfig<
  VuState = unknown,
  M extends MetricsSpec = MetricsSpec,
> {
  /** Middleware applied to every scenario (auth, custom headers, k6 params). */
  use?: ReadonlyArray<Middleware>;
  /** Pass/fail gates. Compiled to k6 thresholds; union-merged with `options.thresholds`. */
  budgets?: Budgets;
  /** Single-scenario shorthand: which k6 Scenario to run. */
  scenario?: Scenario;
  test?: (ctx: Ctx<VuState>) => unknown;
  flow?: FlowBuilder<unknown, VuState>;
  /** Override BASE_URL for the single-scenario shorthand. */
  baseUrl?: string;
  /** Named scenarios — each becomes its own k6 exec function. */
  scenarios?: Record<string, ScenarioBinding<VuState>>;
  /** k6 `setup()` — runs once before all VUs. */
  setup?: () => unknown;
  /** k6 `teardown(data)` — runs once after all VUs. */
  teardown?: (data: unknown) => void;
  /**
   * k6 `handleSummary(data)` — return `{ filename: content }` to control end-of-test
   * output (JUnit, custom JSON, etc.). https://k6.io/docs/results-output/end-of-test/custom-summary/
   */
  handleSummary?: SummaryHandler;
  /**
   * Per-VU init callback. Runs once at the start of each VU's first iteration;
   * the returned value is threaded into every `ctx.vuState` for that VU.
   */
  perVU?: () => VuState;
  /**
   * Declare custom k6 metrics. The compiled `metrics` handle is available to
   * code that imports it from your loadtest module via `lt.metrics`.
   */
  metrics?: M;
  /** Extra k6 options merged into the final options object. `thresholds` union-merges with `budgets`. */
  options?: Partial<Options>;
}

export type CompiledOptions = Options & {
  scenarios: Record<string, Scenario>;
};

export interface CompiledLoadTest<M extends MetricsSpec = MetricsSpec> {
  /** Assign to `export const options`. */
  options: CompiledOptions;
  /** Assign to `export default`. */
  default: () => Promise<void>;
  /** Re-export by name so k6 can dispatch named scenarios. */
  scenarios: Record<string, () => Promise<void>>;
  setup?: () => unknown;
  teardown?: (data: unknown) => void;
  handleSummary?: SummaryHandler;
  /**
   * Typed handle to declared custom metrics — backed by `k6/metrics` instances
   * installed via the generated client preamble.
   */
  metrics: MetricsHandle<M>;
}

/** Compile a load-test config into the static exports k6 expects. */
export function defineLoadTest<
  VuState = unknown,
  M extends MetricsSpec = MetricsSpec,
>(config: LoadTestConfig<VuState, M>): CompiledLoadTest<M> {
  setMiddleware(config.use ?? []);

  const { thresholds: userThresholds, ...passthroughOptions } =
    config.options ?? {};
  const thresholds = mergeThresholds(
    userThresholds,
    compileBudgets(config.budgets),
  );

  const scenarios: Record<string, Scenario> = {};
  const execs: Record<string, () => Promise<void>> = {};

  const hasNamed = config.scenarios && Object.keys(config.scenarios).length > 0;

  if (hasNamed) {
    for (const [name, sc] of Object.entries(config.scenarios!)) {
      scenarios[name] = { ...sc.scenario, exec: name };
      execs[name] = buildExec(sc, config.use, config.perVU);
    }
  } else {
    if (!config.scenario) {
      throw new Error(
        "defineLoadTest: provide either `scenarios` or `scenario`",
      );
    }
    if (!config.test && !config.flow) {
      throw new Error(
        "defineLoadTest: provide either `test` or `flow` alongside `scenario`",
      );
    }
    scenarios.default = { ...config.scenario, exec: "default" };
    execs.default = buildExec(
      {
        scenario: config.scenario,
        test: config.test,
        flow: config.flow,
        baseUrl: config.baseUrl,
      },
      config.use,
      config.perVU,
    );
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
    metrics: resolveMetrics<M>(config.metrics),
  };
}

/**
 * Union-merge two threshold maps per metric. If both define the same metric,
 * specs are concatenated (user-first, derived-after) so neither side is silently dropped.
 */
function mergeThresholds(
  user: Options["thresholds"] | undefined,
  derived: Record<string, ReadonlyArray<Threshold>>,
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

function buildExec<VuState>(
  binding: ScenarioBinding<VuState>,
  inherit?: ReadonlyArray<Middleware>,
  perVU?: () => VuState,
): () => Promise<void> {
  let vuStateMemo: VuState | undefined;
  let vuStateReady = false;

  return async () => {
    if (binding.use !== undefined) setMiddleware(binding.use);
    else if (inherit) setMiddleware(inherit);

    setBaseUrl(binding.baseUrl);

    if (perVU && !vuStateReady) {
      vuStateMemo = perVU();
      vuStateReady = true;
    }

    const ctx = makeCtx<VuState>(vuStateMemo as VuState);

    if (binding.flow) {
      await binding.flow.run(ctx as Ctx<VuState>);
    } else if (binding.test) {
      await binding.test(ctx);
    }
  };
}

/**
 * Resolve a declared metrics spec into a handle backed by `k6/metrics`. The
 * generated client preamble installs the actual `Counter`/`Gauge`/`Rate`/`Trend`
 * classes via `installMetricsFactory` (from `./runtime.js`). In tests (vitest)
 * we resolve to no-op stubs so framework code can be exercised without k6.
 */
function resolveMetrics<M extends MetricsSpec>(
  spec: M | undefined,
): MetricsHandle<M> {
  if (!spec) return {} as MetricsHandle<M>;
  const factory = metricsFactory();
  const out = {} as Record<string, MetricInstance>;
  for (const [name, kind] of Object.entries(spec)) {
    out[name] = factory ? factory(kind, name) : NOOP_METRIC;
  }
  return out as MetricsHandle<M>;
}

const NOOP_METRIC: MetricInstance = {
  add() {
    /* test/no-runtime stub */
  },
};
