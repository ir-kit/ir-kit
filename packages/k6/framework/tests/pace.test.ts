import { describe, expect, it } from "vitest";

import {
  arrivalRate,
  load,
  rampingArrivalRate,
  smoke,
  spike,
  stress,
} from "../src/pace.ts";

describe("smoke", () => {
  it("defaults to 1 VU × 30s constant-vus", () => {
    expect(smoke()).toEqual({
      executor: "constant-vus",
      vus: 1,
      duration: "30s",
    });
  });
});

describe("load", () => {
  it("rampUp → hold → rampDown stages", () => {
    expect(load({ target: 50 })).toEqual({
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
      ],
    });
  });
});

describe("stress", () => {
  it("climbs in steps to ceiling", () => {
    const out = stress({ ceiling: 100, step: 25, perStep: "1m" });
    expect(out.stages?.map((s) => s.target)).toEqual([25, 50, 75, 100, 0]);
  });
});

describe("spike", () => {
  it("baseline → peak → recover", () => {
    const out = spike({
      baseline: 10,
      peak: 100,
      spikeDuration: "30s",
      recoverDuration: "1m",
    });
    expect(out.stages?.[0].target).toBe(100);
    expect(out.stages?.[out.stages.length - 1].target).toBe(0);
  });
});

describe("arrivalRate", () => {
  it("emits constant-arrival-rate with sane defaults", () => {
    expect(
      arrivalRate({ rps: 100, duration: "30s", preAllocatedVUs: 50 }),
    ).toEqual({
      executor: "constant-arrival-rate",
      rate: 100,
      timeUnit: "1s",
      duration: "30s",
      preAllocatedVUs: 50,
      maxVUs: 100,
    });
  });

  it("respects custom timeUnit and maxVUs", () => {
    expect(
      arrivalRate({
        rps: 60,
        duration: "1m",
        preAllocatedVUs: 20,
        maxVUs: 40,
        timeUnit: "1m",
      }),
    ).toMatchObject({
      timeUnit: "1m",
      maxVUs: 40,
      rate: 60,
    });
  });
});

describe("rampingArrivalRate", () => {
  it("emits ramping-arrival-rate carrying the supplied stages", () => {
    const out = rampingArrivalRate({
      preAllocatedVUs: 10,
      stages: [
        { duration: "10s", target: 50 },
        { duration: "30s", target: 200 },
      ],
    });
    expect(out).toMatchObject({
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 20,
      stages: [
        { duration: "10s", target: 50 },
        { duration: "30s", target: 200 },
      ],
    });
  });
});
