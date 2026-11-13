import { existsSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { findConfigFile, importConfig } from "../../src/config-file.js";
import { fileMatcher, globFiles } from "../../src/files.js";
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

  it("reads a CommonJS config again after it changes", async () => {
    const file = join(dir, "ir.config.js");
    await writeFile(file, "module.exports = { n: 1 };\n");
    expect(await importConfig(file)).toEqual({ n: 1 });
    await writeFile(file, "module.exports = { n: 2 };\n");
    expect(await importConfig(file)).toEqual({ n: 2 });
  });

  it("loads a CommonJS .ts config", async () => {
    const file = join(dir, "cjs.config.ts");
    await writeFile(file, "const n: number = 3;\nmodule.exports = { n };\n");
    expect(await importConfig(file)).toEqual({ n: 3 });
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

describe("file patterns", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "fn-schema-files-"));
    await mkdir(join(dir, "src/api"), { recursive: true });
    await writeFile(join(dir, "src/api/a.ts"), "");
    await writeFile(join(dir, "src/api/a.test.ts"), "");
    await symlink(join(dir, "src/api/a.ts"), join(dir, "src/link.ts"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("excludes patterns starting with !", async () => {
    expect(await globFiles(["src/api/*.ts", "!**/*.test.ts"], dir)).toEqual([
      join(dir, "src/api/a.ts"),
    ]);
  });

  it("expands a plain directory to every file under it", async () => {
    expect(await globFiles(["src/api"], dir)).toEqual([
      join(dir, "src/api/a.test.ts"),
      join(dir, "src/api/a.ts"),
    ]);
  });

  it("keeps symlinked files", async () => {
    expect(await globFiles(["src/*.ts"], dir)).toEqual([
      join(dir, "src/link.ts"),
    ]);
  });

  it("accepts absolute patterns for globbing and watching", async () => {
    const pattern = join(dir, "src/api/*.ts");
    expect(await globFiles([pattern, "!**/*.test.ts"], dir)).toEqual([
      join(dir, "src/api/a.ts"),
    ]);
    const m = fileMatcher([pattern, "!**/*.test.ts"], dir);
    expect(m.matches(join(dir, "src/api/a.ts"))).toBe(true);
    expect(m.matches(join(dir, "src/api/a.test.ts"))).toBe(false);
    expect(m.roots).toEqual([join(dir, "src/api")]);
  });

  it("treats cwd itself as everything under cwd", async () => {
    for (const p of [dir, ".", "./"]) {
      expect(fileMatcher([p], dir).include).toEqual(["**"]);
    }
    expect(await globFiles([dir, "!**/*.test.ts"], dir)).toEqual([
      join(dir, "src/api/a.ts"),
      join(dir, "src/link.ts"),
    ]);
  });
});
