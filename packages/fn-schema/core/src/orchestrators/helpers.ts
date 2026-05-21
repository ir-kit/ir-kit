import path from "node:path";

import { glob } from "tinyglobby";

import type { ExcludeFilter, ExtractOptions, IncludeFilter } from "../types.js";

export function resolveCwd(cwd: string | undefined): string {
  return path.resolve(cwd ?? process.cwd());
}

export function collectPatterns(
  fromArg: string | ReadonlyArray<string> | undefined,
  fromConfig: string | ReadonlyArray<string> | undefined,
): string[] {
  const fromArgArr =
    typeof fromArg === "string"
      ? [fromArg]
      : Array.isArray(fromArg)
        ? [...(fromArg as ReadonlyArray<string>)]
        : [];
  if (fromArgArr.length > 0) return fromArgArr;
  if (!fromConfig) return [];
  return Array.isArray(fromConfig)
    ? [...(fromConfig as ReadonlyArray<string>)]
    : [fromConfig as string];
}

export function makeListFiles(
  patternList: ReadonlyArray<string>,
  cwd: string,
): () => Promise<string[]> {
  return () =>
    glob([...patternList], {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/__fn_schema_virtual__/**",
      ],
    });
}

export function mergeInclude(
  fromConfig: IncludeFilter | undefined,
  cliTag: string | undefined,
): IncludeFilter | undefined {
  if (!cliTag && !fromConfig) return undefined;
  return {
    ...(fromConfig ?? {}),
    ...(cliTag ? { jsDocTag: cliTag } : {}),
  };
}

export function mergeExclude(
  fromConfig: ExcludeFilter | undefined,
  cliName: string | undefined,
): ExcludeFilter | undefined {
  if (!cliName && !fromConfig) return undefined;
  const out: ExcludeFilter = { ...(fromConfig ?? {}) };
  if (cliName) {
    if (cliName.length > 500) {
      throw new Error(
        `--exclude-name pattern is too long (${cliName.length} chars; max 500)`,
      );
    }
    try {
      out.name = new RegExp(cliName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid --exclude-name regex "${cliName}": ${msg}`);
    }
  }
  return out;
}

export function baseExtractOpts(
  args: {
    tsconfig?: string;
    includeTag?: string;
    excludeName?: string;
  },
  config: {
    tsConfigPath?: string;
    include?: IncludeFilter;
    exclude?: ExcludeFilter;
  },
  cwd: string,
): ExtractOptions {
  return {
    cwd,
    tsConfigPath: args.tsconfig ?? config.tsConfigPath,
    include: mergeInclude(config.include, args.includeTag),
    exclude: mergeExclude(config.exclude, args.excludeName),
  };
}
