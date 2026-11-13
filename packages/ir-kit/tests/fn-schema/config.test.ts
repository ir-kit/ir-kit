import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { findConfigFile, importConfig } from "../../src/config-file.js";
import { globFiles } from "../../src/files.js";
import { runExtract } from "../../src/fn-schema/core/index.js";
import { typescript } from "../../src/fn-schema/typescript/index.js";

describe("fn-schema config", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "fn-schema-config-"));
    await mkdir(join(dir, "src/node_modules"), { recursive: true });
    await writeFile(
      join(dir, "src/math.ts"),
      "export function add(a: number, b: number): number { return a + b; }\n",
    );
    await writeFile(join(dir, "src/node_modules/skip.ts"), "export {};\n");
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("finds and imports a TypeScript config, reading it again each time", async () => {
    const file = join(dir, "fn-schema.config.ts");
    await writeFile(file, "const n: number = 1;\nexport default { n };\n");
    expect(findConfigFile(dir, "fn-schema")).toBe(file);
    expect(await importConfig(file)).toEqual({ n: 1 });
    await writeFile(file, "export default { n: 2 };\n");
    expect(await importConfig(file)).toEqual({ n: 2 });
  });

  it("globs files and skips node_modules", async () => {
    expect(await globFiles(["**/*.ts"], dir)).toEqual([
      join(dir, "src/math.ts"),
    ]);
  });

  it("writes to the config's out when no output is passed", async () => {
    await writeFile(
      join(dir, "fn-schema.config.ts"),
      'export default { files: "src/**/*.ts", out: "schemas.json" };\n',
    );
    const out = await runExtract({ cwd: dir, extractors: [typescript()] });
    expect(out.written).toEqual([join(dir, "schemas.json")]);
    expect(await readFile(join(dir, "schemas.json"), "utf8")).toContain("add");
    expect(existsSync(join(dir, "schemas.json"))).toBe(true);
  });
});
