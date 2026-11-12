import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { generate, typescript } from "../src/index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(here, "../../../../fixtures/user-events.yaml");

describe("typescript plugin", () => {
  let outDir: string;

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), "asyncapi-ts-plugin-"));
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it("emits types.gen.ts with a type for each message payload", async () => {
    const result = await generate({
      input: FIXTURE,
      output: outDir,
      plugins: [typescript()],
    });

    expect(result.files.map((f) => f.path)).toEqual(["types.gen.ts"]);

    const written = await readFile(join(outDir, "types.gen.ts"), "utf8");
    expect(written).toContain("AUTO-GENERATED");

    expect(written).toContain("export type UserAccountCreatedMessage = {");
    // Inner data fields from components.schemas should be present.
    expect(written).toContain("userId");
    expect(written).toContain("email");
  });

  it("ignores an openapi-ts config file in the working directory", async () => {
    const cwd = process.cwd();
    const dir = await mkdtemp(join(tmpdir(), "asyncapi-ts-cwd-"));
    await writeFile(
      join(dir, "openapi-ts.config.mjs"),
      'export default { output: { fileName: { suffix: ".foo" } } };',
    );
    process.chdir(dir);
    try {
      const result = await generate({
        input: FIXTURE,
        output: join(dir, "out"),
        plugins: [typescript()],
      });
      expect(result.files.map((f) => f.path)).toEqual(["types.gen.ts"]);
    } finally {
      process.chdir(cwd);
      await rm(dir, { recursive: true, force: true });
    }
  });
});
