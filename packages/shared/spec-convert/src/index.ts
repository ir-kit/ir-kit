import { extname, resolve } from "node:path";

import { loadSpec } from "@ir-kit/spec-loader";

import "./converters/openapi3-to-json-schema.js";
import "./converters/typespec-to-openapi3.js";

import { findConverter, listConverters } from "./registry.js";
import type {
  ConvertHandlerOptions,
  SpecDocument,
  SpecFormat,
} from "./types.js";

export type { ConvertHandlerOptions, SpecDocument, SpecFormat };
export { listConverters };

export type ConvertSpecInput = string | SpecDocument;

export interface ConvertSpecOptions {
  input: ConvertSpecInput;
  to: SpecFormat;
  from?: SpecFormat;
  cwd?: string;
  /** Per-target options forwarded to the upstream converter. */
  upstream?: Record<string, unknown>;
}

export interface ConvertSpecResult {
  from: SpecFormat;
  to: SpecFormat;
  document: SpecDocument;
}

/**
 * Convert between API spec formats. Detects the input format via
 * `@ir-kit/spec-loader` (override with `from`); dispatches to a
 * registered `(from → to)` converter; returns the emitted document.
 */
export async function convertSpec(
  opts: ConvertSpecOptions,
): Promise<ConvertSpecResult> {
  const from = opts.from ?? (await detectFormat(opts.input, opts.cwd));
  const handler = findConverter(from, opts.to);
  if (!handler) {
    throw new Error(
      `No converter registered for ${from} → ${opts.to}. ` +
        `Available pairs: ${
          listConverters()
            .map((p) => `${p.from}→${p.to}`)
            .join(", ") || "<none>"
        }`,
    );
  }

  const document = await materializeInput(opts.input, from, opts.cwd);
  const out = await handler.handler(document, {
    cwd: opts.cwd,
    upstream: opts.upstream,
  });
  return { from, to: opts.to, document: out };
}

async function detectFormat(
  input: ConvertSpecInput,
  cwd: string | undefined,
): Promise<SpecFormat> {
  if (typeof input === "object") {
    if ((input as { asyncapi?: unknown }).asyncapi !== undefined)
      return "asyncapi3";
    return "openapi3";
  }
  const ext = extname(input).toLowerCase();
  if (ext === ".tsp") return "typespec";
  if (ext === ".proto") return "proto";
  const result = await loadSpec({ input, cwd });
  return result.kind === "asyncapi" ? "asyncapi3" : "openapi3";
}

async function materializeInput(
  input: ConvertSpecInput,
  from: SpecFormat,
  cwd: string | undefined,
): Promise<SpecDocument> {
  if (from === "typespec") {
    if (typeof input !== "string") {
      throw new Error("typespec input must be a file path");
    }
    return { __path: resolve(cwd ?? process.cwd(), input) };
  }
  if (typeof input === "object") return input;
  const loaded = await loadSpec({ input, cwd });
  if (loaded.kind === "asyncapi") {
    return loaded.document.json() as SpecDocument;
  }
  return loaded.document;
}
