import { describe, expect, it } from "vitest";

import { FlowExpectError, flow } from "../src/flow.ts";
import { makeStepCtx } from "../src/runtime.ts";

describe("flow chain", () => {
  it("threads step outputs forward", () => {
    const ctx = makeStepCtx();
    const chain = flow()
      .step("first", () => 1)
      .step("second", (n) => n + 10)
      .step("third", (n) => n.toString());
    expect(chain.run(ctx)).toBe("11");
  });

  it("expect short-circuits with FlowExpectError on failure", () => {
    const ctx = makeStepCtx();
    const chain = flow()
      .step(() => ({ status: "pending" }))
      .expect((r) => r.status === "active", "status should be active");
    expect(() => chain.run(ctx)).toThrow(FlowExpectError);
  });

  it("describe reports step names + kind", () => {
    const chain = flow()
      .step("a", () => 1)
      .expect((n) => n > 0, "positive")
      .step("b", (n) => n);
    expect(chain.describe()).toEqual([
      { name: "a", kind: "step" },
      { name: "positive", kind: "expect" },
      { name: "b", kind: "step" },
    ]);
  });
});
