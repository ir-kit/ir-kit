import { beforeAll, describe, expect, it } from "vitest";

import { FlowExpectError, flow } from "../src/flow.ts";
import { installK6Bridge, makeCtx } from "../src/runtime.ts";

beforeAll(() => {
  installK6Bridge({
    check: () => true,
    group: (_name, fn) => fn(),
    sleep: () => {},
  });
});

describe("flow chain", () => {
  it("threads step outputs forward", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step("first", () => 1)
      .step("second", (n) => n + 10)
      .step("third", (n) => n.toString());
    expect(await chain.run(ctx)).toBe("11");
  });

  it("expect short-circuits with FlowExpectError on failure", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step(() => ({ status: "pending" }))
      .expect((r) => r.status === "active", "status should be active");
    await expect(chain.run(ctx)).rejects.toBeInstanceOf(FlowExpectError);
  });

  it("awaits async step return values", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step("async", async () => {
        await Promise.resolve();
        return 42;
      })
      .step("double", (n) => n * 2);
    expect(await chain.run(ctx)).toBe(84);
  });

  it("batch awaits Promise values, passes through sync values", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step(() => ({ id: 1 }))
      .batch("page", (input) => ({
        input,
        pet: Promise.resolve({ id: 1, name: "Rex" }),
        count: 7,
      }));
    const out = await chain.run(ctx);
    expect(out).toEqual({
      input: { id: 1 },
      pet: { id: 1, name: "Rex" },
      count: 7,
    });
  });

  it("group runs sub-flow and threads result forward", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step(() => 1)
      .group("inner", (sub) =>
        sub.step("add", (n) => n + 5).step("double", (n) => n * 2),
      )
      .step("plus-one", (n) => n + 1);
    expect(await chain.run(ctx)).toBe(13);
  });

  it("check is recorded but does not fail iteration", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step(() => false)
      .check("always passes through", (v) => v === true) // predicate fails
      .step((v) => `${v}`); // still runs
    expect(await chain.run(ctx)).toBe("false");
  });

  it("sleep is invoked but does not block tests", async () => {
    const ctx = makeCtx(undefined);
    const chain = flow()
      .step(() => 1)
      .sleep("100ms");
    expect(await chain.run(ctx)).toBe(1);
  });

  it("describe reports op kinds and names", () => {
    const chain = flow()
      .step("a", () => 1)
      .expect((n) => n > 0, "positive")
      .check("nonzero", (n) => n !== 0)
      .step("b", (n) => n);
    expect(chain.describe()).toEqual([
      { name: "a", kind: "step" },
      { name: "positive", kind: "expect" },
      { name: "nonzero", kind: "check" },
      { name: "b", kind: "step" },
    ]);
  });
});
