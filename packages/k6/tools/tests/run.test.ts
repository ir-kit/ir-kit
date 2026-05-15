import { describe, expect, it } from "vitest";

import { buildK6Args } from "../src/run/k6-runner.ts";
import { resolveTargets } from "../src/run/targets.ts";

const target = {
  name: "t",
  entry: "/abs/entry.ts",
  outfile: "/abs/dist/loadtest.js",
};

describe("buildK6Args", () => {
  it("forwards --out as a single k6 flag", () => {
    const args = buildK6Args(target, { out: "json=results.json" });
    expect(args).toContain("--out");
    expect(args).toContain("json=results.json");
  });

  it("splits comma-separated --out into multiple k6 flags", () => {
    const args = buildK6Args(target, { out: "json=a.json,csv=b.csv" });
    const outs = args.filter((_, i) => args[i - 1] === "--out");
    expect(outs).toEqual(["json=a.json", "csv=b.csv"]);
  });

  it("forwards --summary as --summary-export=<path>", () => {
    const args = buildK6Args(target, { summary: "summary.json" });
    expect(args).toContain("--summary-export=summary.json");
  });

  it("threads --base-url as -e BASE_URL=<url>", () => {
    const args = buildK6Args(target, { "base-url": "https://staging" });
    const i = args.indexOf("-e");
    expect(args[i + 1]).toBe("BASE_URL=https://staging");
  });

  it("appends --k6-arg passthroughs verbatim before the outfile", () => {
    const args = buildK6Args(target, {
      "k6-arg": ["--http-debug", "--quiet"],
    });
    const debugIdx = args.indexOf("--http-debug");
    expect(args[args.length - 1]).toBe(target.outfile);
    expect(debugIdx).toBeGreaterThan(0);
    expect(debugIdx).toBeLessThan(args.length - 1);
  });
});

describe("resolveTargets", () => {
  const cwd = "/proj";
  const cfg = {};

  it("uses the positional entry verbatim", async () => {
    const t = await resolveTargets(cwd, { entry: "./custom.ts" }, cfg);
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ name: "default", entry: "/proj/custom.ts" });
  });

  it("falls back to config.loadtest", async () => {
    const t = await resolveTargets(cwd, {}, { loadtest: "./alt.ts" });
    expect(t[0].entry).toBe("/proj/alt.ts");
  });

  it("expands config.loadtests into one target per entry", async () => {
    const t = await resolveTargets(
      cwd,
      {},
      { loadtests: { browse: "./browse.ts", write: "./write.ts" } },
    );
    expect(t.map((x) => x.name)).toEqual(["browse", "write"]);
    expect(t[0].outfile.endsWith("browse.js")).toBe(true);
    expect(t[1].outfile.endsWith("write.js")).toBe(true);
  });

  it("filters config.loadtests by --name", async () => {
    const t = await resolveTargets(
      cwd,
      { name: "write" },
      { loadtests: { browse: "./browse.ts", write: "./write.ts" } },
    );
    expect(t).toHaveLength(1);
    expect(t[0].name).toBe("write");
  });
});
