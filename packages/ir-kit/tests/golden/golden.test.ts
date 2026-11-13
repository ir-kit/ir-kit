import { readdirSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import type { IrConfig } from "../../src/generate/config.js";
import { generate } from "../../src/generate/index.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const specs = join(here, "specs");
const snapshots = join(here, "__snapshots__");
const work = await mkdtemp(join(tmpdir(), "ir-golden-"));
afterAll(() => rm(work, { recursive: true, force: true }));

const OPENAPI_TARGETS = [
  "go",
  "kotlin",
  "swift",
  "java",
  "typescript",
  "k6",
] as const;
const ASYNCAPI_TARGETS = ["asyncapi", "go"] as const;

const SKIP_LINE = /^(\s|$|import |package |[})\]]|\/\/|\/\*|\*|@)/;

/**
 * The files a target writes and every top-level declaration in them. Small
 * enough to commit for large specs, and it changes whenever a type, function
 * or file is added, renamed, merged or dropped.
 */
async function surface(dir: string): Promise<string> {
  const files = (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => relative(dir, join(f.parentPath, f.name)))
    .sort();
  const out: string[] = [];
  for (const file of files) {
    out.push(`# ${file}`);
    const text = await readFile(join(dir, file), "utf8");
    if (file.endsWith(".json")) continue;
    for (const line of text.split("\n")) {
      if (!SKIP_LINE.test(line)) out.push(line.trimEnd());
    }
  }
  return `${out.join("\n")}\n`;
}

async function golden(
  name: string,
  input: string,
  targets: ReadonlyArray<string>,
) {
  const base = join(work, name);
  const config = {
    input,
    targets: Object.fromEntries(
      targets.map((t) => [
        t,
        t === "k6" ? { output: t, normalize: true } : { output: t },
      ]),
    ),
  } as IrConfig;
  await generate(config, { cwd: base });
  for (const target of targets) {
    await expect(await surface(join(base, target))).toMatchFileSnapshot(
      join(snapshots, name, `${target}.txt`),
    );
  }
}

describe("golden", () => {
  it(
    "spotify",
    () => golden("spotify", join(specs, "spotify.yaml"), OPENAPI_TARGETS),
    120_000,
  );

  const asyncapi = join(specs, "asyncapi");
  for (const file of readdirSync(asyncapi)) {
    const name = basename(file, ".yaml");
    it(`asyncapi/${name}`, () =>
      golden(`asyncapi/${name}`, join(asyncapi, file), ASYNCAPI_TARGETS));
  }
});
