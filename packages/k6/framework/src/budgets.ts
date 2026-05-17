import type { Threshold } from "k6/options";

import {
  type Duration,
  type Percent,
  parseDurationMs,
  parsePercentRate,
  parseRatePerSecond,
  type Rate,
} from "./format.js";

/** Per-operation budget — narrower than the top-level `Budgets`. */
export interface OpBudget {
  p95?: Duration;
  p99?: Duration;
  errors?: Percent;
}

/** Latency budget for a non-`http_req_duration` metric (e.g. `iteration_duration`). */
export interface DurationBudget {
  p95?: Duration;
  p99?: Duration;
}

export interface Budgets {
  /** p95 of `http_req_duration`. */
  p95?: Duration;
  /** p99 of `http_req_duration`. */
  p99?: Duration;
  /** Max error rate on `http_req_failed`. */
  errors?: Percent;
  /**
   * Minimum throughput floor on the `iterations` Counter. `"100/m"` means
   * "the test must complete ≥ 100 iterations per minute on average."
   */
  iterations?: Rate;
  /**
   * Minimum pass-rate of `flow().check()` results. `"99%"` means
   * "≥ 99% of checks across the run must pass."
   */
  checks?: Percent;
  /**
   * Budget on `iteration_duration` (full iteration including `sleep()`s).
   * Catches slow flows that the per-request `http_req_duration` budget misses.
   */
  iterationDuration?: DurationBudget;
  /**
   * Abort the run mid-test on any budget breach (k6's `abortOnFail: true`).
   * - `true` → abort on first breach
   * - `Duration` → grace window before evaluation (`delayAbortEval`); useful to
   *   let warm-up traffic settle before failing on tail latency.
   *
   * For anything we don't model, pass equivalent specs to `options.thresholds` —
   * those union-merge per metric and you can wrap them in object form yourself.
   */
  abortOnFail?: boolean | Duration;
  /** Per-operation overrides, keyed by operationId (tag-scoped via `operation:<id>`). */
  ops?: Record<string, OpBudget>;
}

export type ThresholdMap = Record<string, ReadonlyArray<Threshold>>;

/** Compile flat budgets to k6's threshold map. Per-op uses `{operation:<id>}` tag filters. */
export function compileBudgets(budgets: Budgets | undefined): ThresholdMap {
  const out: Record<string, Threshold[]> = {};
  if (!budgets) return out;

  const abortMeta = abortOpts(budgets.abortOnFail);
  const wrap = (spec: string): Threshold =>
    abortMeta ? { threshold: spec, ...abortMeta } : spec;

  const durations: Threshold[] = [];
  if (budgets.p95 !== undefined)
    durations.push(wrap(`p(95)<${parseDurationMs(budgets.p95)}`));
  if (budgets.p99 !== undefined)
    durations.push(wrap(`p(99)<${parseDurationMs(budgets.p99)}`));
  if (durations.length) out.http_req_duration = durations;

  if (budgets.errors !== undefined) {
    out.http_req_failed = [wrap(`rate<${parsePercentRate(budgets.errors)}`)];
  }

  if (budgets.iterations !== undefined) {
    out.iterations = [wrap(`rate>${parseRatePerSecond(budgets.iterations)}`)];
  }

  if (budgets.checks !== undefined) {
    out.checks = [wrap(`rate>${parsePercentRate(budgets.checks)}`)];
  }

  if (budgets.iterationDuration) {
    const itDur: Threshold[] = [];
    if (budgets.iterationDuration.p95 !== undefined)
      itDur.push(
        wrap(`p(95)<${parseDurationMs(budgets.iterationDuration.p95)}`),
      );
    if (budgets.iterationDuration.p99 !== undefined)
      itDur.push(
        wrap(`p(99)<${parseDurationMs(budgets.iterationDuration.p99)}`),
      );
    if (itDur.length) out.iteration_duration = itDur;
  }

  for (const [opId, op] of Object.entries(budgets.ops ?? {})) {
    const durList: Threshold[] = [];
    if (op.p95 !== undefined)
      durList.push(wrap(`p(95)<${parseDurationMs(op.p95)}`));
    if (op.p99 !== undefined)
      durList.push(wrap(`p(99)<${parseDurationMs(op.p99)}`));
    if (durList.length) out[`http_req_duration{operation:${opId}}`] = durList;

    if (op.errors !== undefined) {
      out[`http_req_failed{operation:${opId}}`] = [
        wrap(`rate<${parsePercentRate(op.errors)}`),
      ];
    }
  }

  return out;
}

/**
 * Decode the `abortOnFail` budget shape into the partial object form k6 expects.
 * Returns undefined when abort isn't requested — caller emits plain string specs.
 */
function abortOpts(
  abortOnFail: Budgets["abortOnFail"],
): { abortOnFail: true; delayAbortEval?: string } | undefined {
  if (!abortOnFail) return undefined;
  if (abortOnFail === true) return { abortOnFail: true };
  return { abortOnFail: true, delayAbortEval: abortOnFail };
}
