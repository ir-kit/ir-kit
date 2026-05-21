import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import {
  type AsyncAPIInput,
  type LoadAsyncAPIOptions,
  loadAsyncAPI,
} from "@ir-kit/asyncapi-loader";
import {
  type LoadOpenAPIOptions,
  loadOpenAPI,
  type OpenAPIInput,
  resolveOpenAPIInput,
} from "@ir-kit/openapi-loader";
import {
  type CompileTypespecOptions,
  compileTypespec,
  isTypespecPath,
} from "@ir-kit/typespec-loader";

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

async function detectKind(
  input: SpecInput,
  cwd: string | undefined,
): Promise<SpecKind> {
  if (typeof input !== "string") {
    return isAsyncAPIDocument(input) ? "asyncapi" : "openapi";
  }
  const str: string = input;
  if (/\.tsp$/i.test(str.trim())) return "typespec";

  const trimmed = str.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return sniffKindFromString(await fetchHead(trimmed));
  }
  const path = isAbsolute(trimmed)
    ? trimmed
    : resolve(cwd ?? process.cwd(), trimmed);
  return sniffKindFromString(await readFile(path, "utf8"));
}

function sniffKindFromString(text: string): SpecKind {
  const head = text.slice(0, 2048);
  if (/(^|\n)\s*"?asyncapi"?\s*:/.test(head)) return "asyncapi";
  if (/(^|\n)\s*"?openapi"?\s*:/.test(head)) return "openapi";
  if (/(^|\n)\s*"?swagger"?\s*:/.test(head)) return "openapi";
  return "openapi";
}

async function fetchHead(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
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
