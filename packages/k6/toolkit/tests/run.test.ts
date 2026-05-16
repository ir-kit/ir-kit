import { describe, expect, it } from "vitest";

import { buildK6Args } from "../src/spawn-k6.ts";
import { resolveTargets } from "../src/targets.ts";

describe("buildK6Args", () => {
  it("emits one --out per sink", () => {
    const args = buildK6Args("/abs/dist/loadtest.js", {
      out: ["json=results.json", "csv=metrics.csv"],
    });
    const outs = args.filter((_, i) => args[i - 1] === "--out");
    expect(outs).toEqual(["json=results.json", "csv=metrics.csv"]);
  });

  it("forwards `summary` as --summary-export=<path>", () => {
    const args = buildK6Args("/abs/dist/loadtest.js", {
      summary: "summary.json",
    });
    expect(args).toContain("--summary-export=summary.json");
  });

  it("threads `baseUrl` as -e BASE_URL=<url>", () => {
    const args = buildK6Args("/abs/dist/loadtest.js", {
      baseUrl: "https://staging",
    });
    const i = args.indexOf("-e");
    expect(args[i + 1]).toBe("BASE_URL=https://staging");
  });

  it("appends extraArgs verbatim before the outfile", () => {
    const args = buildK6Args("/abs/dist/loadtest.js", {
      extraArgs: ["--http-debug", "--quiet"],
    });
    const debugIdx = args.indexOf("--http-debug");
    expect(args[args.length - 1]).toBe("/abs/dist/loadtest.js");
    expect(debugIdx).toBeGreaterThan(0);
    expect(debugIdx).toBeLessThan(args.length - 1);
  });
});

describe("resolveTargets", () => {
  const cwd = "/proj";

  it("uses the positional entry verbatim", async () => {
    const t = await resolveTargets({ cwd, entry: "./custom.ts" });
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ name: "default", entry: "/proj/custom.ts" });
  });

  it("falls back to config.loadtest", async () => {
    const t = await resolveTargets({ cwd, loadtest: "./alt.ts" });
    expect(t[0].entry).toBe("/proj/alt.ts");
  });

  it("expands loadtests map into one target per entry", async () => {
    const t = await resolveTargets({
      cwd,
      loadtests: { browse: "./browse.ts", write: "./write.ts" },
    });
    expect(t.map((x) => x.name)).toEqual(["browse", "write"]);
    expect(t[0].outfile.endsWith("browse.js")).toBe(true);
    expect(t[1].outfile.endsWith("write.js")).toBe(true);
  });

  it("filters loadtests map by --name", async () => {
    const t = await resolveTargets({
      cwd,
      name: "write",
      loadtests: { browse: "./browse.ts", write: "./write.ts" },
    });
    expect(t).toHaveLength(1);
    expect(t[0].name).toBe("write");
  });

  it("throws when --name is provided without a loadtests map", async () => {
    await expect(resolveTargets({ cwd, name: "ghost" })).rejects.toThrow(
      /no `loadtests` map/,
    );
  });
});
