import type { Params } from "k6/http";
import type { Options } from "k6/options";

export { buildQuery, mergeTags, parseJson } from "./client-runtime.js";

export type HeaderMap = Record<string, string>;

/**
 * Per-request configuration emitted by a middleware. Headers are merged with
 * earlier middleware output; `params` is shallow-merged into the k6 request
 * `Params` (this is where digest/NTLM hook `auth`, and where cookies/tags ride).
 */
export interface Middleware {
  headers?(): HeaderMap;
  params?(): Partial<Params>;
}

let __middleware: ReadonlyArray<Middleware> = [];

export function setMiddleware(middleware: ReadonlyArray<Middleware>): void {
  __middleware = middleware;
}

export function applyMiddlewareHeaders(into: HeaderMap = {}): HeaderMap {
  for (const m of __middleware) {
    const h = m.headers?.();
    if (h) Object.assign(into, h);
  }
  return into;
}

export function applyMiddlewareParams(
  into: Partial<Params> = {},
): Partial<Params> {
  for (const m of __middleware) {
    const p = m.params?.();
    if (!p) continue;
    for (const [k, v] of Object.entries(p)) {
      (into as Record<string, unknown>)[k] = v;
    }
  }
  return into;
}

/** Per-scenario BASE_URL override; `undefined` → __ENV.BASE_URL → fallback. */
let __baseUrl: string | undefined;

export function setBaseUrl(url: string | undefined): void {
  __baseUrl = url;
}

declare const __ENV: Record<string, string | undefined> | undefined;

export function getBaseUrl(fallback: string): string {
  if (__baseUrl !== undefined) return __baseUrl;
  const env = typeof __ENV !== "undefined" ? __ENV?.BASE_URL : undefined;
  return env ?? fallback;
}

declare const __VU: number | undefined;
declare const __ITER: number | undefined;

/** Lazy facades over k6's `exec` module — populated at flow execution time. */
export interface VuCtx {
  /** VU ID within the current k6 instance. */
  readonly idInInstance: number;
  /** VU ID across all k6 instances (global). */
  readonly idInTest: number;
  /** Iteration number for this VU within its instance. */
  readonly iterationInInstance: number;
  /** Iteration number for this VU within its current scenario. */
  readonly iterationInScenario: number;
  /** Mutable tag map applied to every metric this VU emits. */
  readonly tags: Record<string, string | number | boolean>;
}

export interface ScenarioCtx {
  readonly name: string;
  readonly executor: string;
  readonly startTime: number;
  readonly progress: number;
  readonly iterationInInstance: number;
  readonly iterationInTest: number;
}

export interface InstanceCtx {
  readonly currentTestRunDuration: number;
  readonly vusActive: number;
  readonly vusInitialized: number;
  readonly iterationsCompleted: number;
  readonly iterationsInterrupted: number;
}

export interface TestCtx {
  /** Abort the entire test run with a reason. The iteration ends; control does not return. */
  abort(reason?: string): void;
  /** Read the merged k6 options object. */
  options(): Options;
}

export interface Ctx<VuState = unknown> {
  readonly vu: VuCtx;
  readonly scenario: ScenarioCtx;
  readonly instance: InstanceCtx;
  readonly test: TestCtx;
  /** Per-VU state from `defineLoadTest({ perVU })`. `undefined` if not declared. */
  readonly vuState: VuState;
  /** Read env var; throws if missing and no default. */
  env(name: string, defaultValue?: string): string;
}

/**
 * Bridge to k6's static module exports (`check`, `group`, `sleep`). Installed
 * by the generated client preamble — every generated client emits an `import
 * { check, group, sleep } from 'k6'` and calls `installK6Bridge(...)`. This
 * lets framework code use these primitives without a direct `from "k6"` that
 * would fail to resolve in vitest/Node.
 */
export interface K6Bridge {
  check<T>(
    val: T,
    sets: Record<string, (v: T) => boolean>,
    tags?: Record<string, string>,
  ): boolean;
  group<T>(name: string, fn: () => T): T;
  sleep(seconds: number): void;
}

let __k6: K6Bridge | null = null;

export function installK6Bridge(bridge: K6Bridge): void {
  __k6 = bridge;
}

/** Internal — read the installed bridge or throw. */
export function k6Bridge(): K6Bridge {
  if (!__k6) {
    throw new Error(
      "@ir-kit/k6: K6 runtime not installed. Ensure your loadtest imports the generated client (which installs the bridge on first import).",
    );
  }
  return __k6;
}

/** Runtime metric instance (Counter/Gauge/Rate/Trend share `.add`). */
export interface MetricInstance {
  add(value: number | boolean, tags?: Record<string, string>): void;
}

export type MetricKind = "counter" | "gauge" | "rate" | "trend";

export type MetricsFactory = (kind: MetricKind, name: string) => MetricInstance;

let __metricsFactory: MetricsFactory | null = null;

/**
 * Install the metrics factory. Called by the generated client preamble:
 * ```ts
 * installMetricsFactory((kind, name) =>
 *   new ({ counter: Counter, gauge: Gauge, rate: Rate, trend: Trend }[kind])(name)
 * );
 * ```
 */
export function installMetricsFactory(factory: MetricsFactory): void {
  __metricsFactory = factory;
}

export function metricsFactory(): MetricsFactory | null {
  return __metricsFactory;
}

interface ExecModuleShape {
  vu: {
    idInInstance: number;
    idInTest: number;
    iterationInInstance: number;
    iterationInScenario: number;
    tags: Record<string, string | number | boolean>;
  };
  scenario: {
    name: string;
    executor: string;
    startTime: number;
    progress: number;
    iterationInInstance: number;
    iterationInTest: number;
  };
  instance: {
    currentTestRunDuration: number;
    vusActive: number;
    vusInitialized: number;
    iterationsCompleted: number;
    iterationsInterrupted: number;
  };
  test: {
    abort(reason?: string): void;
    options: Options;
  };
}

/**
 * Resolve `k6/execution` at runtime. Returns `null` outside k6 (e.g. vitest) so
 * callers can fall back to `__VU`/`__ITER`/`__ENV` shims for tests.
 */
function tryExec(): ExecModuleShape | null {
  const g = globalThis as { __k6exec__?: ExecModuleShape };
  return g.__k6exec__ ?? null;
}

/**
 * Install the resolved `exec` module. Called from generated client preamble so
 * the framework picks up k6's real module without forcing a static import (which
 * would break vitest). Generated client emits: `import exec from 'k6/execution';
 * (globalThis as any).__k6exec__ = exec;`
 */
export function setExecModule(mod: ExecModuleShape): void {
  (globalThis as { __k6exec__?: ExecModuleShape }).__k6exec__ = mod;
}

export function makeCtx<VuState>(vuState: VuState): Ctx<VuState> {
  const exec = tryExec();

  const vu: VuCtx = exec
    ? exec.vu
    : {
        idInInstance: typeof __VU !== "undefined" ? __VU : 0,
        idInTest: typeof __VU !== "undefined" ? __VU : 0,
        iterationInInstance: typeof __ITER !== "undefined" ? __ITER : 0,
        iterationInScenario: typeof __ITER !== "undefined" ? __ITER : 0,
        tags: {},
      };

  const scenario: ScenarioCtx = exec
    ? exec.scenario
    : {
        name: "default",
        executor: "constant-vus",
        startTime: 0,
        progress: 0,
        iterationInInstance: 0,
        iterationInTest: 0,
      };

  const instance: InstanceCtx = exec
    ? exec.instance
    : {
        currentTestRunDuration: 0,
        vusActive: 0,
        vusInitialized: 0,
        iterationsCompleted: 0,
        iterationsInterrupted: 0,
      };

  const test: TestCtx = {
    abort(reason) {
      if (exec) {
        exec.test.abort(reason);
        return;
      }
      throw new Error(`test.abort: ${reason ?? "no reason given"}`);
    },
    options() {
      return (exec ? exec.test.options : {}) as Options;
    },
  };

  return {
    vu,
    scenario,
    instance,
    test,
    vuState,
    env(name, defaultValue) {
      const v = (globalThis as { __ENV?: Record<string, string> }).__ENV?.[
        name
      ];
      if (v !== undefined) return v;
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Missing env var: ${name}`);
    },
  };
}
