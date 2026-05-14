import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { assertSafeOutputDir } from "@ahmedrowaihi/codegen-core";
import {
  type NormalizeOptions,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "@ahmedrowaihi/openapi-core";
import { parseSpec } from "@ahmedrowaihi/openapi-tools/parse";
import { $RefParser } from "@hey-api/json-schema-ref-parser";

import {
  emitClientFile,
  emitDataFile,
  emitIndexFile,
  emitTypesFile,
} from "./emit/index.js";

export interface BuiltFile {
  /** Path relative to the output dir. */
  path: string;
  content: string;
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
}

export interface GenerateResult {
  files: BuiltFile[];
  /** Absolute path to the output directory. */
  output: string;
}

/** Generate the typed k6 client + types + faker-backed data builders. */
export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const parser = new $RefParser();
  const bundled = (await parser.bundle({
    pathOrUrlOrSchema: opts.input,
  })) as Record<string, unknown>;

  if (opts.normalize) {
    normalizeSpec(
      bundled,
      opts.normalize === true ? SAFE_NORMALIZE : opts.normalize,
    );
  }
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

  const out = resolve(opts.output);
  if (!opts.dryRun) {
    assertSafeOutputDir(out);
    for (const file of files) {
      const full = join(out, file.path);
      await mkdir(dirname(full), { recursive: true });
      await writeFile(full, file.content);
    }
  }

  return { files, output: out };
}
