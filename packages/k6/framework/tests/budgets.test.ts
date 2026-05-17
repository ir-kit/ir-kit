import { describe, expect, it } from "vitest";

import { compileBudgets } from "../src/budgets.ts";

describe("compileBudgets", () => {
  it("compiles flat p95/p99/errors to k6 threshold strings", () => {
    expect(
      compileBudgets({
        p95: "500ms",
        p99: "1.5s",
        errors: "1%",
      }),
    ).toEqual({
      http_req_duration: ["p(95)<500", "p(99)<1500"],
      http_req_failed: ["rate<0.01"],
    });
  });

  it("emits per-op threshold keys with tag filters", () => {
    const out = compileBudgets({
      p95: "500ms",
      ops: {
        getPetById: { p95: "100ms" },
        addPet: { errors: "0%" },
      },
    });
    expect(out).toMatchObject({
      "http_req_duration{operation:getPetById}": ["p(95)<100"],
      "http_req_failed{operation:addPet}": ["rate<0"],
    });
  });

  it("returns empty map for undefined budgets", () => {
    expect(compileBudgets(undefined)).toEqual({});
  });

  it("compiles iterations rate floor (`100/m` → rate per second)", () => {
    const out = compileBudgets({ iterations: "100/m" });
    expect(out.iterations).toHaveLength(1);
    const spec = out.iterations![0] as string;
    expect(spec.startsWith("rate>")).toBe(true);
    expect(Number(spec.slice("rate>".length))).toBeCloseTo(100 / 60, 4);
  });

  it("compiles checks pass-rate", () => {
    expect(compileBudgets({ checks: "99%" })).toEqual({
      checks: ["rate>0.99"],
    });
  });

  it("compiles iteration_duration percentiles", () => {
    expect(
      compileBudgets({ iterationDuration: { p95: "2s", p99: "5s" } }),
    ).toEqual({
      iteration_duration: ["p(95)<2000", "p(99)<5000"],
    });
  });

  it("wraps all specs in object form when abortOnFail: true", () => {
    const out = compileBudgets({
      p95: "500ms",
      errors: "1%",
      abortOnFail: true,
    });
    expect(out.http_req_duration).toEqual([
      { threshold: "p(95)<500", abortOnFail: true },
    ]);
    expect(out.http_req_failed).toEqual([
      { threshold: "rate<0.01", abortOnFail: true },
    ]);
  });

  it("adds delayAbortEval when abortOnFail is a Duration", () => {
    const out = compileBudgets({
      p95: "500ms",
      abortOnFail: "10s",
    });
    expect(out.http_req_duration).toEqual([
      { threshold: "p(95)<500", abortOnFail: true, delayAbortEval: "10s" },
    ]);
  });

  it("falls back to plain string specs when abortOnFail is false/absent", () => {
    expect(compileBudgets({ p95: "500ms", abortOnFail: false })).toEqual({
      http_req_duration: ["p(95)<500"],
    });
    expect(compileBudgets({ p95: "500ms" })).toEqual({
      http_req_duration: ["p(95)<500"],
    });
  });

  it("applies abortOnFail to per-op specs too", () => {
    const out = compileBudgets({
      ops: { getPet: { p95: "100ms" } },
      abortOnFail: true,
    });
    expect(out["http_req_duration{operation:getPet}"]).toEqual([
      { threshold: "p(95)<100", abortOnFail: true },
    ]);
  });
});
