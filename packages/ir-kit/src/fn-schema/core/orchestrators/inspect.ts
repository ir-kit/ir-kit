import { createProject } from "../project.js";
import type { ExtractResult } from "../types.js";

type SignatureEntry = ExtractResult["signatures"][number];

import { loadFnSchemaConfig } from "./config.js";
import {
  baseExtractOpts,
  listSourceFiles,
  mergeSchema,
  mergeSignature,
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

  const files = await listSourceFiles(opts.patterns, config.files, cwd);
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
      signature: mergeSignature(opts, config),
      schema: mergeSchema(opts, config),
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
