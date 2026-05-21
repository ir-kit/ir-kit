import type { WalkedOperation } from "@ir-kit/k6-gen";
import { describe, expect, it } from "vitest";

import {
  type ScaffoldScenarioOpts,
  scaffoldScenario,
} from "../src/scaffold/scenario.ts";

function fakeOp(overrides: Partial<WalkedOperation> = {}): WalkedOperation {
  return {
    id: "getPet",
    method: "get",
    path: "/pets/{id}",
    tags: ["pet"],
    pathParams: [],
    queryParams: [],
    headerParams: [],
    ...overrides,
  } as WalkedOperation;
}

function baseOpts(
  overrides: Partial<ScaffoldScenarioOpts> = {},
): ScaffoldScenarioOpts {
  return {
    clientImportPath: "./src/gen/index.js",
    pace: "smoke",
    ops: [fakeOp()],
    chain: "sequential",
    ...overrides,
  };
}

describe("scaffoldScenario", () => {
  it("emits the no-auth shape — no useAuth import, no `use:` field", () => {
    const out = scaffoldScenario(baseOpts());
    expect(out).toMatch(
      /import \{ defineLoadTest, flow, smoke \} from "@ir-kit\/k6"/,
    );
    expect(out).not.toMatch(/useAuth/);
    expect(out).not.toMatch(/^\s*use:/m);
  });

  it("uses `scenario:` not `pace:` (v2 vocabulary)", () => {
    const out = scaffoldScenario(baseOpts({ duration: "1m" }));
    expect(out).toMatch(/scenario:\s*smoke\(\{\s*duration:\s*"1m"\s*\}\)/);
    expect(out).not.toMatch(/^\s*pace:/m);
  });

  it("sequential chain emits .step() per op with api.<id>(…) calls", () => {
    const out = scaffoldScenario(
      baseOpts({
        ops: [
          fakeOp({ id: "first" }),
          fakeOp({ id: "second", path: "/second" }),
        ],
      }),
    );
    expect(out).toMatch(/\.step\("first",\s*\(\)\s*=>\s*\{[\s\S]*api\.first/);
    expect(out).toMatch(/\.step\("second",\s*\(\)\s*=>\s*\{[\s\S]*api\.second/);
  });

  it("batch chain emits flow.batch() with api.async.<id>() values", () => {
    const out = scaffoldScenario(
      baseOpts({
        chain: "batch",
        ops: [
          fakeOp({ id: "first" }),
          fakeOp({ id: "second", path: "/second" }),
        ],
      }),
    );
    expect(out).toMatch(
      /import \{ defineLoadTest, flow, smoke, batch \} from "@ir-kit\/k6"/,
    );
    expect(out).toMatch(/\.batch\("fan-out",\s*\(\)\s*=>/);
    expect(out).toMatch(/first:\s*api\.async\.first\(/);
    expect(out).toMatch(/second:\s*api\.async\.second\(/);
  });

  it("falls back to sequential when batch is requested with a single op", () => {
    const out = scaffoldScenario(baseOpts({ chain: "batch" }));
    expect(out).not.toMatch(/\.batch\(/);
    expect(out).toMatch(/\.step\("getPet"/);
  });

  it("emits placeholder flow when no ops are supplied", () => {
    const out = scaffoldScenario(baseOpts({ ops: [] }));
    expect(out).toMatch(/\.step\("health",\s*\(\)\s*=>\s*\{\s*\}\)/);
  });

  it("wires top-level budgets with sane defaults", () => {
    const out = scaffoldScenario(baseOpts());
    expect(out).toMatch(
      /budgets:\s*\{[\s\S]*p95:\s*"500ms"[\s\S]*errors:\s*"1%"/,
    );
  });

  it("threads per-op budgets into the ops: block", () => {
    const out = scaffoldScenario(
      baseOpts({
        budgets: { p95: "300ms", ops: { getPet: { p95: "100ms" } } },
      }),
    );
    expect(out).toMatch(/ops:\s*\{[\s\S]*getPet:\s*\{[\s\S]*p95:\s*"100ms"/);
  });

  it("emits useAuth.bearer + use:[auth] when bearer auth is set", () => {
    const out = scaffoldScenario(
      baseOpts({ auth: { auth: "bearer", bearerEnv: "API_TOKEN" } }),
    );
    expect(out).toMatch(
      /import \{ defineLoadTest, flow, smoke, useAuth \} from "@ir-kit\/k6"/,
    );
    expect(out).toMatch(
      /const auth = useAuth\.bearer\(\{ env: "API_TOKEN" \}\);/,
    );
    expect(out).toMatch(/use:\s*\[auth\]/);
  });

  it("re-exports options + default — runnable shape", () => {
    const out = scaffoldScenario(baseOpts());
    expect(out).toMatch(/export const options = lt\.options;/);
    expect(out).toMatch(/export default lt\.default;/);
  });
});
