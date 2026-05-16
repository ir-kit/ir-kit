import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { assertSafeOutputDir } from "@ahmedrowaihi/codegen-core";
import type { NormalizeOptions } from "@ahmedrowaihi/openapi-core";
import { loadSpec } from "@ahmedrowaihi/openapi-tools";
import { parseSpec } from "@ahmedrowaihi/openapi-tools/parse";
import type { IR } from "@hey-api/shared";

import {
  emitClientFile,
  emitDataFile,
  emitIndexFile,
  emitLoadtestStubs,
  emitTypesFile,
} from "./emit/index.js";

export interface BuiltFile {
  /** Path relative to the output dir. */
  path: string;
  content: string;
}

export interface ScaffoldOptions {
  /** Subdirectory inside `output` for the stubs. Default: `loadtests`. */
  dir?: string;
  /** How the stubs import the generated client. Default: `../index.js`. */
  clientImport?: string;
}

export interface GenerateOptions {
  /** OpenAPI spec source. Path, URL, or pre-parsed spec object. */
  input: string | Record<string, unknown>;
  /** Output directory. Created if missing. */
  output: string;
  /** Falls back to spec `servers[0].url`. */
  defaultBaseUrl?: string;
  /** Pre-codegen spec normalization. `true` enables the safe preset. */
  normalize?: boolean | NormalizeOptions;
  /** Don't write to disk — just return the files. */
  dryRun?: boolean;
  /**
   * Emit one minimal `loadtests/<op>.ts` skeleton per operation alongside
   * the typed client. `true` uses defaults; pass an object to customize.
   * Files are written, not overwritten — pre-existing stubs are left alone.
   */
  scaffold?: boolean | ScaffoldOptions;
}

export interface GenerateResult {
  files: BuiltFile[];
  /** Absolute path to the output directory. */
  output: string;
  /** Parsed IR — exposed so callers can run secondary passes (rename diffs, doc gen). */
  ir: IR.Model;
}

/** Generate the typed k6 client + types + faker-backed data builders. */
export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const bundled = await loadSpec({
    input: opts.input,
    normalize: opts.normalize,
  });
  const ir = parseSpec(bundled);

  const defaultBaseUrl = opts.defaultBaseUrl ?? ir.servers?.[0]?.url ?? "";

  const schemaNames = Object.keys(ir.components?.schemas ?? {});
  const files: BuiltFile[] = [
    { path: "types.ts", content: emitTypesFile(ir.components?.schemas) },
    {
      path: "client.ts",
      content: emitClientFile(ir.paths, { defaultBaseUrl, schemaNames }),
    },
    { path: "data.ts", content: emitDataFile(ir.components?.schemas) },
    { path: "index.ts", content: emitIndexFile() },
  ];

  const stubs = opts.scaffold
    ? emitLoadtestStubs(
        ir.paths,
        ir.components?.schemas as Record<string, unknown> | undefined,
        typeof opts.scaffold === "object" ? opts.scaffold : {},
      )
    : [];

  const out = resolve(opts.output);
  if (!opts.dryRun) {
    assertSafeOutputDir(out);
    for (const file of files) {
      const full = join(out, file.path);
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, file.content);
    }
    // Stubs are user-editable — never overwrite once they exist.
    for (const file of stubs) {
      const full = join(out, file.path);
      if (existsSync(full)) continue;
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, file.content);
    }
  }

  return { files: [...files, ...stubs], output: out, ir };
}
