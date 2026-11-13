import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as emit from "../emit/index.js";
import { createProject } from "../project.js";
import type { Diagnostic, ExtractOptions, ExtractResult } from "../types.js";

import { loadFnSchemaConfig } from "./config.js";
import {
  listSourceFiles,
  mergeExclude,
  mergeInclude,
  mergeSchema,
  mergeSignature,
  resolveCwd,
} from "./helpers.js";

export type Dialect = "draft-07" | "draft-2020-12" | "openapi-3.1";
export type Naming = "function-name" | "file-function" | "jsdoc-tag";
export type Params = "array" | "first-only" | "object";

export interface RunExtractOptions {
  cwd?: string;
  patterns?: string | ReadonlyArray<string>;
  tsconfig?: string;
  includeTag?: string;
  excludeName?: string;
  params?: Params;
  unwrapPromise?: boolean;
  naming?: Naming;
  dialect?: Dialect;
  identity?: string | false;
  transport?: string | false;
  sourceLocations?: string | false;
  outDir?: string;
  bundlePath?: string;
  bundleTypes?: boolean;
  openapiPath?: string;
  pretty?: boolean;
  /** Extra extractors to register (e.g. typescript()). */
  extractors?: ReadonlyArray<
    Parameters<typeof createProject>[0]["extractors"][number]
  >;
}

export interface RunExtractResult {
  result: ExtractResult;
  diagnostics: ReadonlyArray<Diagnostic>;
  errors: number;
  written: ReadonlyArray<string>;
  durationMs: number;
  /** When `null`, the caller short-circuited (no patterns, no files). */
  ok: boolean;
}

/**
 * Programmatic one-shot extract pipeline: resolve config, discover
 * files, run the extractor, write any requested outputs, return a
 * structured result. No process.exit, no signal handling, no watch —
 * the CLI layer composes those on top.
 */
export async function runExtract(
  opts: RunExtractOptions,
): Promise<RunExtractResult> {
  const start = Date.now();
  const cwd = resolveCwd(opts.cwd);
  const config = await loadFnSchemaConfig(cwd);

  const fileList = await listSourceFiles(opts.patterns, config.files, cwd);
  if (fileList.length === 0) {
    return emptyResult(start);
  }

  const extractOpts: ExtractOptions = {
    cwd,
    files: fileList,
    tsConfigPath: opts.tsconfig ?? config.tsConfigPath,
    include: mergeInclude(config.include, opts.includeTag),
    exclude: mergeExclude(config.exclude, opts.excludeName),
    signature: mergeSignature(opts, config),
    schema: mergeSchema(opts, config),
    naming: opts.naming ?? config.naming,
  };

  const project = createProject({
    cwd,
    tsConfigPath: extractOpts.tsConfigPath,
    extractors: opts.extractors ? [...opts.extractors] : [],
  });

  try {
    const result = await project.extract(extractOpts);
    const written = await emitOutputs(
      result,
      { ...opts, ...configOutputs(opts, config) },
      cwd,
    );
    return {
      result,
      diagnostics: result.diagnostics,
      errors: result.diagnostics.filter((d) => d.severity === "error").length,
      written,
      durationMs: Date.now() - start,
      ok: true,
    };
  } finally {
    project.dispose();
  }
}

/** The config's `out` and `format`, used when no output was passed. */
function configOutputs(
  opts: RunExtractOptions,
  config: Awaited<ReturnType<typeof loadFnSchemaConfig>>,
): Partial<RunExtractOptions> {
  if (opts.outDir || opts.bundlePath || opts.openapiPath || !config.out) {
    return {};
  }
  switch (config.format ?? (config.out.endsWith(".json") ? "bundle" : "json")) {
    case "openapi":
      return { openapiPath: config.out };
    case "bundle":
      return { bundlePath: config.out };
    case "json-pretty":
      return { outDir: config.out, pretty: opts.pretty ?? true };
    default:
      return { outDir: config.out };
  }
}

function emptyResult(start: number): RunExtractResult {
  return {
    result: {
      signatures: [],
      definitions: {},
      diagnostics: [],
      stats: { filesScanned: 0, functionsFound: 0, durationMs: 0 },
    },
    diagnostics: [],
    errors: 0,
    written: [],
    durationMs: Date.now() - start,
    ok: false,
  };
}

async function emitOutputs(
  result: ExtractResult,
  opts: RunExtractOptions,
  cwd: string,
): Promise<string[]> {
  const written: string[] = [];
  if (opts.outDir) {
    const files = await emit.toFiles(result, {
      dir: path.resolve(cwd, opts.outDir),
      format: opts.pretty ? "json-pretty" : "json",
    });
    written.push(...files);
  }
  if (opts.bundlePath) {
    const abs = path.resolve(cwd, opts.bundlePath);
    await mkdir(path.dirname(abs), { recursive: true });
    const json = emit.toBundle(result, {
      pretty: opts.pretty ?? false,
      dialect: opts.dialect,
    });
    await writeFile(abs, json);
    written.push(abs);
    if (opts.bundleTypes) {
      const typesPath = `${abs.replace(/\.json$/i, "")}.ts`;
      const jsonImport = `./${path.basename(abs)}`;
      const tsSource = emit.toBundleTypesModule(result, { jsonImport });
      await writeFile(typesPath, tsSource);
      written.push(typesPath);
    }
  }
  if (opts.openapiPath) {
    const abs = path.resolve(cwd, opts.openapiPath);
    await mkdir(path.dirname(abs), { recursive: true });
    const doc = emit.toOpenAPI(result, { title: "fn-schema" });
    await writeFile(abs, JSON.stringify(doc, null, opts.pretty ? 2 : 0));
    written.push(abs);
  }
  return written;
}
