import type {
  ConstantArrivalRateScenario,
  ConstantVUsScenario,
  RampingArrivalRateScenario,
  RampingVUsScenario,
} from "k6/options";

import type { Duration } from "./format.js";

export type { Scenario, Stage } from "k6/options";

export interface SmokeOpts {
  /** @default 1 */
  vus?: number;
  /** @default "30s" */
  duration?: Duration;
}

/**
 * CI sanity — constant VUs, short window. "Did anything 5xx?"
 *
 * ```
 * VUs
 *  1 │████████████████████│
 *  0 └────────────────────┘
 *    0s                 30s
 * ```
 */
export function smoke(opts: SmokeOpts = {}): ConstantVUsScenario {
  return {
    executor: "constant-vus",
    vus: opts.vus ?? 1,
    duration: opts.duration ?? "30s",
  };
}

export interface LoadOpts {
  /** Sustained VU count after ramp-up. */
  target: number;
  /** @default "30s" */
  rampUp?: Duration;
  /** @default "1m" */
  hold?: Duration;
  /** @default "30s" */
  rampDown?: Duration;
  /** @default 0 */
  startVUs?: number;
}

/**
 * Steady-state at `target` VUs with ramp-in/out. Realistic production traffic.
 *
 * ```
 * VUs
 * 20 │     ┌────────────────┐
 *    │    ╱                  ╲
 * 10 │   ╱                    ╲
 *    │  ╱                      ╲
 *  0 │─╯                        ╲────
 *    0s 30s                 1m30s 2m
 *    ◀rampUp▶ ◀──── hold ────▶ ◀rampDown▶
 * ```
 *
 * For shapes other than rampUp/hold/rampDown, pass a raw `Scenario` literal to `pace:`.
 */
export function load(opts: LoadOpts): RampingVUsScenario {
  return {
    executor: "ramping-vus",
    startVUs: opts.startVUs ?? 0,
    stages: [
      { duration: opts.rampUp ?? "30s", target: opts.target },
      { duration: opts.hold ?? "1m", target: opts.target },
      { duration: opts.rampDown ?? "30s", target: 0 },
    ],
  };
}

export interface StressOpts {
  /** Top VU count to climb to. */
  ceiling: number;
  /** VUs added each rung. */
  step: number;
  /** Hold time at each rung. */
  perStep: Duration;
  /** @default 0 */
  startVUs?: number;
  /** @default "30s" */
  rampDown?: Duration;
}

/**
 * Climb in rungs to `ceiling` — find where things break.
 *
 * ```
 * VUs
 * 100│                       ┌────┐
 *  75│                  ┌────┘    │╲
 *  50│             ┌────┘         │ ╲
 *  25│        ┌────┘              │  ╲
 *   0│────────┘                   │   ╲──
 *           ◀── perStep ──▶ … ◀rampDown▶
 * ```
 *
 * Each rung holds `perStep` so you can observe behavior before adding more pressure.
 */
export function stress(opts: StressOpts): RampingVUsScenario {
  const stages: Array<{ duration: string; target: number }> = [];
  const rungs = Math.ceil(opts.ceiling / opts.step);
  for (let i = 1; i <= rungs; i++) {
    stages.push({
      duration: opts.perStep,
      target: Math.min(i * opts.step, opts.ceiling),
    });
  }
  stages.push({ duration: opts.rampDown ?? "30s", target: 0 });
  return {
    executor: "ramping-vus",
    startVUs: opts.startVUs ?? 0,
    stages,
  };
}

export interface SpikeOpts {
  /** VU count before & after the spike. */
  baseline: number;
  /** VU count at the peak. */
  peak: number;
  /** Time held at peak. */
  spikeDuration: Duration;
  /** Time held at baseline after recovery. */
  recoverDuration: Duration;
  /** @default "10s" */
  rampIn?: Duration;
  /** @default "10s" */
  rampOut?: Duration;
}

/**
 * Baseline → sudden burst → recover. Tests elasticity (deploy spike, cache stampede, Black Friday).
 *
 * ```
 * VUs
 * 100│        ┌─────────────────┐
 *    │       ╱                   ╲
 *  50│      ╱                     ╲
 *    │     ╱                       ╲
 *  10│────╯                         ╲────────────────╲
 *   0│                                                ╲──
 *    ◀baseline▶ ◀rampIn▶ ◀ spike ▶ ◀rampOut▶ ◀ recover ▶ ◀tail▶
 * ```
 */
export function spike(opts: SpikeOpts): RampingVUsScenario {
  return {
    executor: "ramping-vus",
    startVUs: opts.baseline,
    stages: [
      { duration: opts.rampIn ?? "10s", target: opts.peak },
      { duration: opts.spikeDuration, target: opts.peak },
      { duration: opts.rampOut ?? "10s", target: opts.baseline },
      { duration: opts.recoverDuration, target: opts.baseline },
      { duration: "10s", target: 0 },
    ],
  };
}

/**
 * Focused concurrency on a single op — bug repros / regression isolation.
 *
 * ```
 * VUs
 * 10 │████████████████████│   (constant burst, narrow target)
 *  0 └────────────────────┘
 *    0s                  1m
 * ```
 */
export function repro(opts: SmokeOpts = {}): ConstantVUsScenario {
  return {
    executor: "constant-vus",
    vus: opts.vus ?? 10,
    duration: opts.duration ?? "1m",
  };
}

export interface SoakOpts {
  /** @default 10 */
  vus?: number;
  /** @default "1h" */
  duration?: Duration;
}

/**
 * Long, flat run — slow-leak detection, sustained pressure. Needs TIME, not load.
 *
 * ```
 * VUs
 * 10 │████████████████████████│   (flat for hours)
 *  0 └────────────────────────┘
 *    0s                      1h
 * ```
 */
export function soak(opts: SoakOpts = {}): ConstantVUsScenario {
  return {
    executor: "constant-vus",
    vus: opts.vus ?? 10,
    duration: opts.duration ?? "1h",
  };
}

export interface ArrivalRateOpts {
  /** Iterations per `timeUnit`. The throughput target. */
  rps: number;
  /** Total duration k6 sustains `rps`. */
  duration: Duration;
  /** Initial pool of VUs k6 will use to hit `rps`. */
  preAllocatedVUs: number;
  /** Ceiling for VU growth if rps demands more. @default preAllocatedVUs × 2 */
  maxVUs?: number;
  /** Window `rps` is measured over. @default "1s" */
  timeUnit?: Duration;
}

/**
 * Open-model constant throughput — fires `rps` iterations/sec regardless of API latency.
 * The right model for SLO testing ("API must handle 500 RPS").
 *
 * ```
 * RPS  (← requests/sec, NOT VUs)
 * 500│████████████████████████│   k6 grows VU pool to maintain throughput
 *    │
 *  0 └────────────────────────┘
 *    0s                      1m
 * ```
 *
 * If the API slows, k6 spawns VUs up to `maxVUs` to keep firing 500/sec.
 * For ramped throughput see {@link rampingArrivalRate}.
 */
export function arrivalRate(
  opts: ArrivalRateOpts,
): ConstantArrivalRateScenario {
  return {
    executor: "constant-arrival-rate",
    rate: opts.rps,
    timeUnit: opts.timeUnit ?? "1s",
    duration: opts.duration,
    preAllocatedVUs: opts.preAllocatedVUs,
    maxVUs: opts.maxVUs ?? opts.preAllocatedVUs * 2,
  };
}

export interface RampingArrivalRateOpts {
  /**
   * Stages in iterations/timeUnit (NOT VUs). `target: 100` with `timeUnit: "1s"` means
   * "ramp to 100 iterations/second".
   */
  stages: ReadonlyArray<{ duration: string; target: number }>;
  /** Initial pool of VUs k6 will use. */
  preAllocatedVUs: number;
  /** Ceiling for VU growth if throughput demands more. @default preAllocatedVUs × 2 */
  maxVUs?: number;
  /** Window throughput is measured over. @default "1s" */
  timeUnit?: Duration;
  /** Iterations/timeUnit at scenario start. @default 0 */
  startRate?: number;
}

/**
 * Open-model ramped throughput — change target RPS over time.
 *
 * ```
 * RPS
 * 500│              ┌──────────────────┐
 *    │             ╱                    ╲
 * 250│            ╱                      ╲
 *    │           ╱                        ╲
 *   0│──────────╯                          ╲────
 *    ◀── stage1 ──▶ ◀───── stage2 ─────▶ ◀stage3▶
 *      (ramp 0→500)   (hold 500)         (ramp 500→0)
 * ```
 */
export function rampingArrivalRate(
  opts: RampingArrivalRateOpts,
): RampingArrivalRateScenario {
  return {
    executor: "ramping-arrival-rate",
    startRate: opts.startRate ?? 0,
    timeUnit: opts.timeUnit ?? "1s",
    preAllocatedVUs: opts.preAllocatedVUs,
    maxVUs: opts.maxVUs ?? opts.preAllocatedVUs * 2,
    stages: [...opts.stages],
  };
}
