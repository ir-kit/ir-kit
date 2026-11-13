import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import {
  type AsyncAPIInput,
  type LoadAsyncAPIOptions,
  loadAsyncAPI,
} from "../asyncapi/index.js";
import {
  type LoadOpenAPIOptions,
  loadOpenAPI,
  type OpenAPIInput,
  readSpecDocument,
  resolveOpenAPIInput,
} from "../openapi/index.js";
import {
  type CompileTypespecOptions,
  compileTypespec,
  isTypespecPath,
} from "../typespec/index.js";

export type {
  AsyncAPIInput,
  LoadAsyncAPIOptions,
  LoadOpenAPIOptions,
  OpenAPIInput,
};
export {
  compileTypespec,
  isTypespecPath,
  loadAsyncAPI,
  loadOpenAPI,
  readSpecDocument,
  resolveOpenAPIInput,
};

export type SpecKind = "openapi" | "asyncapi" | "typespec";

export type SpecInput =
  | string
  | Record<string, unknown>
  | AsyncAPIDocumentInterface;

export interface LoadSpecOptions extends CompileTypespecOptions {
  input: SpecInput;
  /** Force the spec kind, skipping detection. Useful when the file
   *  extension is ambiguous (e.g. `api.json` that's actually AsyncAPI). */
  kind?: SpecKind;
  /** Forwarded to `loadOpenAPI` (and to TypeSpec after compile). */
  normalize?: LoadOpenAPIOptions["normalize"];
}

export type LoadSpecResult =
  | { kind: "openapi"; document: Record<string, unknown> }
  | { kind: "asyncapi"; document: AsyncAPIDocumentInterface };

/**
 * Detect the spec format and dispatch to the matching per-format loader.
 * TypeSpec inputs compile to OpenAPI 3 in-memory and return as
 * `{ kind: "openapi" }`. Pre-parsed objects are kept as-is and
 * classified by the `asyncapi` / `openapi` / `swagger` top-level key.
 */
export async function loadSpec(opts: LoadSpecOptions): Promise<LoadSpecResult> {
  const kind = opts.kind ?? (await detectKind(opts.input, opts.cwd));

  if (kind === "typespec") {
    const path = typeof opts.input === "string" ? opts.input : "";
    if (!path) {
      throw new Error("TypeSpec input must be a file path ending in .tsp");
    }
    const { document } = await compileTypespec({ path }, opts);
    return {
      kind: "openapi",
      document: document as unknown as Record<string, unknown>,
    };
  }

  if (kind === "asyncapi") {
    if (typeof opts.input !== "string" && !isAsyncAPIDocument(opts.input)) {
      throw new Error(
        "asyncapi input must be a string path/URL or an AsyncAPIDocumentInterface",
      );
    }
    const document = await loadAsyncAPI({
      input: opts.input as AsyncAPIInput,
      cwd: opts.cwd,
    });
    return { kind: "asyncapi", document };
  }

  if (
    typeof opts.input !== "string" &&
    !isPlainOpenAPIObject(opts.input as Record<string, unknown>)
  ) {
    throw new Error(
      "openapi input must be a string path/URL or a plain object",
    );
  }
  const document = await loadOpenAPI({
    input: opts.input as OpenAPIInput,
    cwd: opts.cwd,
    normalize: opts.normalize,
  });
  return { kind: "openapi", document };
}

/** Classify a parsed document by its root version field. */
export function classifySpecDocument(
  document: Record<string, unknown>,
): "openapi" | "asyncapi" | undefined {
  if (document.asyncapi !== undefined) return "asyncapi";
  if (document.openapi !== undefined || document.swagger !== undefined)
    return "openapi";
  return undefined;
}

async function detectKind(
  input: SpecInput,
  cwd: string | undefined,
): Promise<SpecKind> {
  if (isAsyncAPIDocument(input)) return "asyncapi";
  if (typeof input === "string" && isTypespecPath(input.trim()))
    return "typespec";
  const document =
    typeof input === "string" ? await readSpecDocument(input, cwd) : input;
  const kind = isPlainOpenAPIObject(document)
    ? classifySpecDocument(document)
    : undefined;
  if (!kind) {
    const label = typeof input === "string" ? ` ${input}` : "";
    throw new Error(
      `Unrecognized spec${label}: expected a top-level "openapi", "swagger" or "asyncapi" field.`,
    );
  }
  return kind;
}

function isAsyncAPIDocument(
  value: unknown,
): value is AsyncAPIDocumentInterface {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { json?: unknown }).json === "function" &&
    typeof (value as { version?: unknown }).version === "function"
  );
}

function isPlainOpenAPIObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
