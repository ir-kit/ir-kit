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
});
