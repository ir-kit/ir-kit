import { describe, expect, it } from "vitest";

import { defineLoadTest } from "../src/define-load-test.ts";
import { flow } from "../src/flow.ts";
import { smoke } from "../src/pace.ts";
import { applyMiddlewareHeaders } from "../src/runtime.ts";
import { useAuth } from "../src/use-auth.ts";

describe("defineLoadTest (shorthand)", () => {
  it("compiles single-flow form to a default scenario", () => {
    const lt = defineLoadTest({
      pace: smoke({ duration: "30s" }),
      budgets: { p95: "500ms" },
      flow: flow().step(() => 1),
    });
    expect(lt.options.scenarios).toHaveProperty("default");
    expect(lt.options.scenarios.default.exec).toBe("default");
    expect(lt.options.thresholds).toMatchObject({
      http_req_duration: ["p(95)<500"],
    });
  });

  it("rejects missing pace + scenarios", () => {
    expect(() => defineLoadTest({ test: () => {} })).toThrow(/pace/);
  });
});

describe("defineLoadTest (named scenarios)", () => {
  it("emits one exec per scenario, threaded via `exec`", () => {
    const lt = defineLoadTest({
      scenarios: {
        browse: { pace: smoke({ duration: "30s" }), test: () => {} },
        write: { pace: smoke({ duration: "30s" }), test: () => {} },
      },
    });
    expect(lt.options.scenarios.browse.exec).toBe("browse");
    expect(lt.options.scenarios.write.exec).toBe("write");
    expect(Object.keys(lt.scenarios)).toEqual(["browse", "write"]);
    expect(typeof lt.default).toBe("function");
  });
});

describe("middleware integration", () => {
  it("auth bearer header is applied at request time", () => {
    process.env.TEST_TOKEN = "abc123";
    defineLoadTest({
      use: [useAuth.bearer({ env: "TEST_TOKEN" })],
      pace: smoke(),
      test: () => {},
    });
    expect(applyMiddlewareHeaders()).toEqual({
      Authorization: "Bearer abc123",
    });
    delete process.env.TEST_TOKEN;
  });
});
