import { extname, resolve } from "node:path";

import { loadSpec } from "@ir-kit/spec-loader";

import "./converters/openapi3-to-json-schema.js";
import "./converters/openapi3-to-typespec.js";
import "./converters/postman-to-openapi3.js";
import "./converters/proto-to-openapi3.js";
import "./converters/typespec-to-json-schema.js";
import "./converters/typespec-to-openapi3.js";
import "./converters/typespec-to-proto.js";

import { findConverter, listConverters } from "./registry.js";
import type {
  ConvertHandlerOptions,
  ConvertOutput,
  SpecDocument,
  SpecFormat,
} from "./types.js";

export type { ConvertHandlerOptions, ConvertOutput, SpecDocument, SpecFormat };
export { listConverters };

export type ConvertSpecInput = string | SpecDocument;

export interface ConvertSpecOptions {
  input: ConvertSpecInput;
  to: SpecFormat;
  from?: SpecFormat;
  cwd?: string;
  upstream?: Record<string, unknown>;
}

export interface ConvertSpecResult {
  from: SpecFormat;
  to: SpecFormat;
  output: ConvertOutput;
}

/**
 * Convert between API spec formats. Detects the input format via
 * `@ir-kit/spec-loader` (override with `from`); dispatches to a
 * registered `(from → to)` converter; returns either a parsed document
 * or a source string depending on the target format.
 */
export async function convertSpec(
  opts: ConvertSpecOptions,
): Promise<ConvertSpecResult> {
  const from = opts.from ?? (await detectFormat(opts.input, opts.cwd));
  const pair = findConverter(from, opts.to);
  if (!pair) {
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
  const output = await pair.handler(document, {
    cwd: opts.cwd,
    upstream: opts.upstream,
  });
  return { from, to: opts.to, output };
}

async function detectFormat(
  input: ConvertSpecInput,
  cwd: string | undefined,
): Promise<SpecFormat> {
  if (typeof input === "object") {
    if ((input as { asyncapi?: unknown }).asyncapi !== undefined)
      return "asyncapi3";
    if (isPostmanCollection(input)) return "postman";
    return "openapi3";
  }
  const ext = extname(input).toLowerCase();
  if (ext === ".tsp") return "typespec";
  if (ext === ".proto") return "proto";
  if (input.toLowerCase().endsWith(".postman_collection.json"))
    return "postman";
  const result = await loadSpec({ input, cwd });
  if (result.kind === "asyncapi") return "asyncapi3";
  if (
    result.kind === "openapi" &&
    isPostmanCollection(result.document as Record<string, unknown>)
  ) {
    return "postman";
  }
  return "openapi3";
}

function isPostmanCollection(doc: Record<string, unknown>): boolean {
  const info = doc.info as { schema?: unknown } | undefined;
  return (
    typeof info?.schema === "string" &&
    info.schema.includes("schema.getpostman.com")
  );
}

async function materializeInput(
  input: ConvertSpecInput,
  from: SpecFormat,
  cwd: string | undefined,
): Promise<SpecDocument> {
  if (from === "typespec" || from === "proto" || from === "postman") {
    if (typeof input !== "string") {
      throw new Error(`${from} input must be a file path`);
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
