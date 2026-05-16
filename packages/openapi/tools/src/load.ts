import { isAbsolute, resolve } from "node:path";

import {
  type NormalizeOptions,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "@ahmedrowaihi/openapi-core";
import { $RefParser } from "@hey-api/json-schema-ref-parser";

export type SpecInput = string | Record<string, unknown>;

export interface LoadSpecOptions {
  /** File path, URL, or pre-parsed spec object. */
  input: SpecInput;
  /** Working directory used to resolve relative paths. Default: `process.cwd()`. */
  cwd?: string;
  /**
   * Apply normalization after bundling. `true` enables the safe preset
   * shared by every generator; pass an object for custom rules.
   */
  normalize?: boolean | NormalizeOptions;
}

/**
 * Single-source loader for every generator in the workspace.
 * Path-vs-URL detection, `$RefParser.bundle()`, and the optional
 * normalize step all happen here so individual generators stay focused
 * on IR → target conversion.
 */
export async function loadSpec(
  opts: LoadSpecOptions,
): Promise<Record<string, unknown>> {
  const parser = new $RefParser();
  const bundled = (await parser.bundle({
    pathOrUrlOrSchema: resolveSpecInput(opts.input, opts.cwd),
  })) as Record<string, unknown>;

  if (opts.normalize) {
    normalizeSpec(
      bundled,
      opts.normalize === true ? SAFE_NORMALIZE : opts.normalize,
    );
  }

  return bundled;
}

/**
 * Normalize a spec input string: URLs pass through verbatim, absolute
 * paths pass through, relative paths resolve against `cwd`. Pre-parsed
 * objects are returned as-is.
 */
export function resolveSpecInput(
  input: SpecInput,
  cwd: string = process.cwd(),
): SpecInput {
  if (typeof input !== "string") return input;
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("OpenAPI spec input is empty or only whitespace.");
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (isAbsolute(trimmed)) return trimmed;
  return resolve(cwd, trimmed);
}
