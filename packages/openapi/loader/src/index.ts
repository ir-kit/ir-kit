import { isAbsolute, resolve } from "node:path";
import { $RefParser } from "@hey-api/json-schema-ref-parser";
import {
  type NormalizeOptions,
  normalizeSpec,
  SAFE_NORMALIZE,
} from "@ir-kit/openapi";

export type OpenAPIInput = string | Record<string, unknown>;

export interface LoadOpenAPIOptions {
  input: OpenAPIInput;
  cwd?: string;
  /** Apply hey-api-aware normalization after bundling. `true` enables
   *  the safe preset; pass an object for custom rules. */
  normalize?: boolean | NormalizeOptions;
}

export async function loadOpenAPI(
  opts: LoadOpenAPIOptions,
): Promise<Record<string, unknown>> {
  const bundled = (await new $RefParser().bundle({
    pathOrUrlOrSchema: resolveOpenAPIInput(opts.input, opts.cwd),
  })) as Record<string, unknown>;

  if (opts.normalize) {
    normalizeSpec(
      bundled,
      opts.normalize === true ? SAFE_NORMALIZE : opts.normalize,
    );
  }

  return bundled;
}

export function resolveOpenAPIInput(
  input: OpenAPIInput,
  cwd: string = process.cwd(),
): OpenAPIInput {
  if (typeof input !== "string") return input;
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("OpenAPI spec input is empty or only whitespace.");
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (isAbsolute(trimmed)) return trimmed;
  return resolve(cwd, trimmed);
}
