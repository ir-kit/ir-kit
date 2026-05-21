import { createProject } from "../project.js";
import type { ExtractResult } from "../types.js";

type SignatureEntry = ExtractResult["signatures"][number];

import { loadFnSchemaConfig } from "./config.js";
import {
  baseExtractOpts,
  collectPatterns,
  makeListFiles,
  resolveCwd,
} from "./helpers.js";

export interface RunInspectOptions {
  name: string;
  cwd?: string;
  patterns?: string | ReadonlyArray<string>;
  tsconfig?: string;
  params?: "array" | "first-only" | "object";
  unwrapPromise?: boolean;
  identity?: string;
  transport?: string;
  extractors?: ReadonlyArray<
    Parameters<typeof createProject>[0]["extractors"][number]
  >;
}

export type RunInspectResult =
  | { kind: "not-found"; filesScanned: number }
  | {
      kind: "ambiguous";
      matches: ReadonlyArray<SignatureEntry>;
    }
  | {
      kind: "ok";
      signature: SignatureEntry;
      result: ExtractResult;
    };

export async function runInspect(
  opts: RunInspectOptions,
): Promise<RunInspectResult> {
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
    return { kind: "not-found", filesScanned: 0 };
  }

  const baseOpts = baseExtractOpts({ tsconfig: opts.tsconfig }, config, cwd);

  const project = createProject({
    cwd,
    tsConfigPath: baseOpts.tsConfigPath,
    extractors: opts.extractors ? [...opts.extractors] : [],
  });

  try {
    const result = await project.extract({
      ...baseOpts,
      files,
      include: { name: opts.name },
      signature: {
        ...(config.signature ?? {}),
        parameters: opts.params ?? config.signature?.parameters,
        unwrapPromise: opts.unwrapPromise ?? config.signature?.unwrapPromise,
      },
      schema: {
        ...(config.schema ?? {}),
        identity: opts.identity ?? config.schema?.identity,
        transport: opts.transport ?? config.schema?.transport,
      },
    });
    const matches = result.signatures.filter((s) => s.name === opts.name);
    if (matches.length === 0) {
      return { kind: "not-found", filesScanned: files.length };
    }
    if (matches.length > 1) return { kind: "ambiguous", matches };
    return { kind: "ok", signature: matches[0]!, result };
  } finally {
    project.dispose();
  }
}
