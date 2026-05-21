import { createProject } from "../project.js";
import type { DiscoverResult, ExtractOptions } from "../types.js";

import { loadFnSchemaConfig } from "./config.js";
import {
  baseExtractOpts,
  collectPatterns,
  makeListFiles,
  resolveCwd,
} from "./helpers.js";

export interface RunScanOptions {
  cwd?: string;
  patterns?: string | ReadonlyArray<string>;
  tsconfig?: string;
  includeTag?: string;
  excludeName?: string;
  extractors?: ReadonlyArray<
    Parameters<typeof createProject>[0]["extractors"][number]
  >;
}

export interface RunScanResult {
  result: DiscoverResult;
  filesScanned: number;
  errors: number;
  warnings: number;
  durationMs: number;
  ok: boolean;
}

export async function runScan(opts: RunScanOptions): Promise<RunScanResult> {
  const start = Date.now();
  const cwd = resolveCwd(opts.cwd);
  const config = await loadFnSchemaConfig(cwd);

  const patternList = collectPatterns(opts.patterns, config.files);
  if (patternList.length === 0) {
    throw new Error(
      "No source patterns supplied. Pass patterns or set `files` in fn-schema.config.{ts,js,json}.",
    );
  }

  const files = await makeListFiles(patternList, cwd)();
  if (files.length === 0) {
    return {
      result: {
        signatures: [],
        diagnostics: [],
        stats: { filesScanned: 0, durationMs: 0 },
      } as unknown as DiscoverResult,
      filesScanned: 0,
      errors: 0,
      warnings: 0,
      durationMs: Date.now() - start,
      ok: false,
    };
  }

  const baseOpts = baseExtractOpts(
    {
      tsconfig: opts.tsconfig,
      includeTag: opts.includeTag,
      excludeName: opts.excludeName,
    },
    config,
    cwd,
  );

  const project = createProject({
    cwd,
    tsConfigPath: baseOpts.tsConfigPath,
    extractors: opts.extractors ? [...opts.extractors] : [],
  });

  try {
    const result = await project.discover({
      ...baseOpts,
      files,
    } as ExtractOptions);
    return {
      result,
      filesScanned: result.stats.filesScanned,
      errors: result.diagnostics.filter((d) => d.severity === "error").length,
      warnings: result.diagnostics.filter((d) => d.severity === "warning")
        .length,
      durationMs: Date.now() - start,
      ok: true,
    };
  } finally {
    project.dispose();
  }
}
