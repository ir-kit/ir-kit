import {
  type Duration,
  type Percent,
  parseDurationMs,
  parsePercentRate,
} from "./format.js";

export interface OpBudget {
  p95?: Duration;
  p99?: Duration;
  errors?: Percent;
}

export interface Budgets {
  /** p95 of `http_req_duration`. */
  p95?: Duration;
  /** p99 of `http_req_duration`. */
  p99?: Duration;
  /** Max error rate (failed-response percent). */
  errors?: Percent;
  /** Per-operation overrides, keyed by operationId. */
  ops?: Record<string, OpBudget>;
}

export type ThresholdMap = Record<string, ReadonlyArray<string>>;

/** Compile flat budgets to k6's threshold map (per-op uses `{operation:<id>}` tag filters). */
export function compileBudgets(budgets: Budgets | undefined): ThresholdMap {
  const out: Record<string, string[]> = {};
  if (!budgets) return out;

  const durOps: string[] = [];
  if (budgets.p95 !== undefined)
    durOps.push(`p(95)<${parseDurationMs(budgets.p95)}`);
  if (budgets.p99 !== undefined)
    durOps.push(`p(99)<${parseDurationMs(budgets.p99)}`);
  if (durOps.length) out.http_req_duration = durOps;

  if (budgets.errors !== undefined) {
    out.http_req_failed = [`rate<${parsePercentRate(budgets.errors)}`];
  }

  for (const [opId, op] of Object.entries(budgets.ops ?? {})) {
    const durList: string[] = [];
    if (op.p95 !== undefined) durList.push(`p(95)<${parseDurationMs(op.p95)}`);
    if (op.p99 !== undefined) durList.push(`p(99)<${parseDurationMs(op.p99)}`);
    if (durList.length) out[`http_req_duration{operation:${opId}}`] = durList;

    if (op.errors !== undefined) {
      out[`http_req_failed{operation:${opId}}`] = [
        `rate<${parsePercentRate(op.errors)}`,
      ];
    }
  }

  return out;
}
