import path from "node:path";
import { globFiles } from "../../../files.js";
import type { ExcludeFilter, ExtractOptions, IncludeFilter } from "../types.js";
import type { loadFnSchemaConfig } from "./config.js";
import type { RunExtractOptions } from "./extract.js";

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
  return () => globFiles(patternList, cwd);
}

/** Glob the source files named by `fromArg`, falling back to the config's `files`. */
export async function listSourceFiles(
  fromArg: string | ReadonlyArray<string> | undefined,
  fromConfig: string | ReadonlyArray<string> | undefined,
  cwd: string,
): Promise<string[]> {
  const patterns = collectPatterns(fromArg, fromConfig);
  if (patterns.length === 0) {
    throw new Error(
      "No source patterns supplied. Pass patterns or set `files` in fn-schema.config.{ts,js,json}.",
    );
  }
  return makeListFiles(patterns, cwd)();
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

type FnSchemaConfig = Awaited<ReturnType<typeof loadFnSchemaConfig>>;

/** CLI flags over config for the `signature` options. */
export function mergeSignature(
  opts: Pick<RunExtractOptions, "params" | "unwrapPromise">,
  config: FnSchemaConfig,
): ExtractOptions["signature"] {
  return {
    ...(config.signature ?? {}),
    parameters: opts.params ?? config.signature?.parameters,
    unwrapPromise: opts.unwrapPromise ?? config.signature?.unwrapPromise,
  };
}

/** CLI flags over config for the `schema` options. `""` or `"false"` turns a keyword off. */
export function mergeSchema(
  opts: Partial<
    Pick<
      RunExtractOptions,
      "dialect" | "identity" | "transport" | "sourceLocations"
    >
  >,
  config: FnSchemaConfig,
): ExtractOptions["schema"] {
  return {
    ...(config.schema ?? {}),
    dialect: opts.dialect ?? config.schema?.dialect,
    identity: pickKey(opts.identity, config.schema?.identity),
    transport: pickKey(opts.transport, config.schema?.transport),
    sourceLocations: pickKey(
      opts.sourceLocations,
      config.schema?.sourceLocations,
    ),
  };
}

function pickKey(
  cli: string | false | undefined,
  fallback: false | string | undefined,
): false | string {
  if (cli === false) return false;
  if (typeof cli === "string") {
    if (cli === "" || cli === "false") return false;
    return cli;
  }
  return fallback ?? false;
}
