import type { Duration } from "./format.js";

export interface Scenario {
  executor: "constant-vus" | "ramping-vus";
  vus?: number;
  duration?: string;
  startVUs?: number;
  stages?: ReadonlyArray<{ duration: string; target: number }>;
  exec?: string;
  tags?: Record<string, string>;
}

export interface SmokeOpts {
  /** @default 1 */
  vus?: number;
  /** @default "30s" */
  duration?: Duration;
}

/** CI sanity — constant VUs, short window. */
export function smoke(opts: SmokeOpts = {}): Scenario {
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

/** Steady-state at `target` VUs with ramp-in/out. */
export function load(opts: LoadOpts): Scenario {
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

/** Climb in steps to `ceiling` — find where things break. */
export function stress(opts: StressOpts): Scenario {
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

/** Baseline → quick spike to `peak` → recover. Tests elasticity. */
export function spike(opts: SpikeOpts): Scenario {
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

/** Focused concurrency on a single op — bug repros / regression isolation. */
export function repro(opts: SmokeOpts = {}): Scenario {
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

/** Long, flat run — slow-leak detection, sustained pressure. */
export function soak(opts: SoakOpts = {}): Scenario {
  return {
    executor: "constant-vus",
    vus: opts.vus ?? 10,
    duration: opts.duration ?? "1h",
  };
}
