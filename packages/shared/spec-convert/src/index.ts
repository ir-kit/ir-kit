import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve } from "node:path";

import { loadSpec } from "@ir-kit/spec-loader";

const require = createRequire(import.meta.url);

/** typespec-loader's package dir hosts the @typespec/* peer deps the
 *  TypeSpec compiler needs to resolve when chaining converters. */
const typespecLoaderDir = dirname(
  require.resolve("@ir-kit/typespec-loader/package.json"),
);

import "./converters/openapi3-to-json-schema.js";
import "./converters/openapi3-to-postman.js";
import "./converters/openapi3-to-typespec.js";
import "./converters/postman-to-openapi3.js";
import "./converters/proto-to-openapi3.js";
import "./converters/typespec-to-json-schema.js";
import "./converters/typespec-to-openapi3.js";
import "./converters/typespec-to-proto.js";

import {
  findConverter,
  findConverterPath,
  listConverters,
} from "./registry.js";
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
 * `@ir-kit/spec-loader` (override with `from`). Uses a direct
 * `(from → to)` converter when one is registered; otherwise BFS-routes
 * through intermediate formats (chains like `proto → openapi3 → postman`
 * are discovered automatically). Returns either a parsed document, a
 * source string, or a multi-file map depending on the target.
 */
export async function convertSpec(
  opts: ConvertSpecOptions,
): Promise<ConvertSpecResult> {
  const from = opts.from ?? (await detectFormat(opts.input, opts.cwd));

  if (from === opts.to) {
    const document = await readAsDocument(opts.input, opts.cwd);
    return { from, to: opts.to, output: { kind: "document", document } };
  }

  const direct = findConverter(from, opts.to);
  const path = direct ? [direct] : findConverterPath(from, opts.to);
  if (!path || path.length === 0) {
    throw new Error(
      `No converter path from ${from} to ${opts.to}. ` +
        `Available edges: ${
          listConverters()
            .map((p) => `${p.from}→${p.to}`)
            .join(", ") || "<none>"
        }`,
    );
  }

  let document = await materializeInput(opts.input, from, opts.cwd);
  let output: ConvertOutput | undefined;
  let tempDir: string | undefined;
  try {
    for (let i = 0; i < path.length; i++) {
      const edge = path[i]!;
      output = await edge.handler(document, {
        cwd: opts.cwd,
        upstream: opts.upstream,
      });
      if (i < path.length - 1) {
        if (output.kind === "document") {
          document = output.document;
        } else if (output.kind === "source") {
          tempDir ??= await mkdtemp(
            join(typespecLoaderDir, ".ir-spec-convert-"),
          );
          const tempPath = join(tempDir, `intermediate-${i}.${output.ext}`);
          await writeFile(tempPath, output.source);
          document = { __path: tempPath };
        } else {
          throw new Error(
            `Cannot chain through ${edge.to}: intermediate output is '${output.kind}', cannot bridge to next converter`,
          );
        }
      }
    }
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  }
  return { from, to: opts.to, output: output! };
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
  return readAsDocument(input, cwd);
}

async function readAsDocument(
  input: ConvertSpecInput,
  cwd: string | undefined,
): Promise<SpecDocument> {
  if (typeof input === "object") return input;
  const loaded = await loadSpec({ input, cwd });
  if (loaded.kind === "asyncapi") {
    return loaded.document.json() as SpecDocument;
  }
  return loaded.document;
}
