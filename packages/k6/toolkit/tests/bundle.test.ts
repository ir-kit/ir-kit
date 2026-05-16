import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bundle } from "../src/bundle.ts";

describe("bundle", () => {
  let dir: string;
  let entry: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "k6-toolkit-bundle-"));
    await mkdir(join(dir, "src"), { recursive: true });
    entry = join(dir, "src", "loadtest.ts");
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("writes a single ESM file at outDir/<entry-stem>.{mjs|js}", async () => {
    await writeFile(
      entry,
      'export default function () { console.log("hi"); }\n',
    );

    const outDir = join(dir, "out");
    const { outfile } = await bundle({ entry, outDir });

    expect(outfile.startsWith(outDir)).toBe(true);
    const content = await readFile(outfile, "utf8");
    expect(content).toContain("hi");
  });

  it("treats `k6/*` imports as external by default", async () => {
    await writeFile(
      entry,
      `import http from "k6/http";\nexport default () => http.get("/");\n`,
    );

    const outDir = join(dir, "out");
    const { outfile } = await bundle({ entry, outDir });
    const content = await readFile(outfile, "utf8");

    // External: the import is preserved, not bundled in.
    expect(content).toMatch(/from\s+["']k6\/http["']/);
    expect(content).not.toContain("function http(");
  });
});
