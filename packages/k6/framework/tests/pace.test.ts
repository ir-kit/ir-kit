import { describe, expect, it } from "vitest";

import { load, smoke, spike, stress } from "../src/pace.ts";

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
