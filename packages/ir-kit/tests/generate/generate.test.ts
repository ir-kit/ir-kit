import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  defineConfig,
  generate,
  loadIrConfig,
  renderConfig,
  writeConfig,
} from "../../src/generate/index.js";

const petstore = join(
  import.meta.dirname,
  "../../../../fixtures/petstore.yaml",
);

describe("ir generate", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "ir-generate-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const config = defineConfig({
    input: petstore,
    targets: {
      go: { output: "sdk/go", packageName: "petstore" },
      k6: { output: "k6", scaffold: true },
    },
  });

  it("writes every target, then --check passes", async () => {
    const results = await generate(config, { cwd: dir });
    expect(results.map((r) => r.target)).toEqual(["go", "k6"]);
    expect(existsSync(join(dir, "sdk/go/api_client.go"))).toBe(true);

    const check = await generate(config, { cwd: dir, check: true });
    expect(check.flatMap((r) => r.stale)).toEqual([]);
  });

  it("--check reports changed, missing and extra files", async () => {
    await generate(config, { cwd: dir });
    await writeFile(join(dir, "sdk/go/api_client.go"), "package petstore\n");
    await rm(join(dir, "k6/index.ts"));
    await writeFile(join(dir, "sdk/go/old.go"), "package petstore\n");

    const check = await generate(config, { cwd: dir, check: true });
    expect(check.find((r) => r.target === "go")?.stale).toEqual([
      "changed: api_client.go",
      "extra: old.go",
    ]);
    expect(check.find((r) => r.target === "k6")?.stale).toEqual([
      "missing: index.ts",
    ]);
    expect(await readFile(join(dir, "sdk/go/api_client.go"), "utf8")).toBe(
      "package petstore\n",
    );
  });

  it("--check leaves edited k6 loadtest stubs alone", async () => {
    await generate(config, { cwd: dir });
    const stub = join(dir, "k6/loadtests/addPet.ts");
    expect(existsSync(stub)).toBe(true);
    await writeFile(stub, "// mine\n");

    const check = await generate(config, { cwd: dir, check: true });
    expect(check.flatMap((r) => r.stale)).toEqual([]);
  });

  it("rejects unknown targets and options", async () => {
    await expect(
      generate(
        { input: petstore, targets: { rust: { output: "x" } } as never },
        { cwd: dir },
      ),
    ).rejects.toThrow('Unknown target "rust"');
    await expect(
      generate(
        {
          input: petstore,
          targets: { go: { output: "x", gradle: true } as never },
        },
        { cwd: dir },
      ),
    ).rejects.toThrow('Unknown option "gradle" on target go');
  });

  it("runs only the targets asked for", async () => {
    const results = await generate(config, { cwd: dir, only: ["k6"] });
    expect(results.map((r) => r.target)).toEqual(["k6"]);
    expect(existsSync(join(dir, "sdk/go"))).toBe(false);
  });

  it("loads ir.config.ts relative to its own directory", async () => {
    await writeFile(
      join(dir, "ir.config.ts"),
      `export default { input: ${JSON.stringify(petstore)}, targets: { go: { output: "out" } } };\n`,
    );
    const loaded = await loadIrConfig({ cwd: dir });
    expect(loaded.cwd).toBe(dir);
    expect(loaded.config.targets.go?.output).toBe("out");
  });

  it("explains how to start when there is no config", async () => {
    await expect(loadIrConfig({ cwd: dir })).rejects.toThrow("ir init");
  });

  it("writes a starter config and won't replace it", async () => {
    await writeFile(join(dir, "package.json"), '{ "type": "module" }');
    await writeConfig({ cwd: dir, input: "openapi.yaml", targets: ["go"] });
    expect(await readFile(join(dir, "ir.config.ts"), "utf8")).toBe(
      renderConfig("openapi.yaml", ["go"]),
    );
    await expect(
      writeConfig({ cwd: dir, input: "x.yaml", targets: ["go"] }),
    ).rejects.toThrow("already exists");
  });

  it("writes ir.config.mts outside an ES module package", async () => {
    await writeFile(join(dir, "package.json"), '{ "type": "commonjs" }');
    expect(
      await writeConfig({ cwd: dir, input: "openapi.yaml", targets: ["go"] }),
    ).toBe(join(dir, "ir.config.mts"));
  });

  it("replaces a CommonJS ir.config.js with ir.config.mts on --force", async () => {
    await writeFile(join(dir, "package.json"), '{ "type": "commonjs" }');
    await writeFile(join(dir, "ir.config.js"), "module.exports = {};\n");
    await writeConfig({
      cwd: dir,
      input: "x.yaml",
      targets: ["go"],
      force: true,
    });
    expect(existsSync(join(dir, "ir.config.js"))).toBe(false);
    expect(existsSync(join(dir, "ir.config.mts"))).toBe(true);
  });
});

describe("ir generate --check with heyApi.output", () => {
  it("writes to its temp directory, not to heyApi.output", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ir-generate-"));
    try {
      const config = defineConfig({
        input: petstore,
        targets: {
          typescript: {
            output: "sdk/ts",
            heyApi: { output: { path: "elsewhere", clean: true } },
          },
        },
      });
      await generate(config, { cwd: dir, check: true });
      expect(existsSync(join(dir, "elsewhere"))).toBe(false);
      expect(existsSync(join(dir, "sdk/ts"))).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
