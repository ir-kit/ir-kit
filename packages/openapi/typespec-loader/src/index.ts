import type { CompilerOptions } from "@typespec/compiler";
import {
  getOpenAPI3,
  type SupportedOpenAPIDocuments,
} from "@typespec/openapi3";

import { type CompileTypespecInput, withProgram } from "./compile.js";

export type { CompileTypespecInput };

export type CompileTypespecOptions = {
  cwd?: string;
  openapi?: Record<string, unknown>;
};

export type OpenAPIDocument = SupportedOpenAPIDocuments;

export type CompileTypespecResult = {
  documents: ReadonlyArray<OpenAPIDocument>;
  document: OpenAPIDocument;
};

export {
  type CompileCaptureOptions,
  type CompileCaptureResult,
  compileTypespecCapture,
} from "./compile-capture.js";

/**
 * Compile a TypeSpec entry point to an OpenAPI 3 document in memory.
 * Accepts either a file path or an inline source string. No disk
 * artifacts survive the call. Throws on `error`-severity diagnostics.
 */
export async function compileTypespec(
  input: CompileTypespecInput,
  options: CompileTypespecOptions = {},
): Promise<CompileTypespecResult> {
  const emitterOptions = options.openapi ?? {};
  const compilerOptions: CompilerOptions = {
    noEmit: true,
    emit: ["@typespec/openapi3"],
    options: { "@typespec/openapi3": emitterOptions },
  };

  return withProgram(input, options.cwd, compilerOptions, async (program) => {
    const records = await getOpenAPI3(
      program,
      emitterOptions as Parameters<typeof getOpenAPI3>[1],
    );
    const documents: OpenAPIDocument[] = [];
    for (const record of records) {
      if (record.versioned === false) {
        documents.push(record.document);
      } else {
        for (const v of record.versions) documents.push(v.document);
      }
    }
    if (documents.length === 0) {
      throw new Error(
        "TypeSpec compilation produced no OpenAPI 3 documents (is there a @service namespace?)",
      );
    }

    return {
      documents,
      get document() {
        if (documents.length > 1) {
          throw new Error(
            `TypeSpec compilation produced ${documents.length} OpenAPI documents; use \`documents\` to handle them explicitly.`,
          );
        }
        return documents[0]!;
      },
    };
  });
}

/** `true` when `input` is a string path ending in `.tsp` (case-insensitive). */
export function isTypespecPath(input: unknown): input is string {
  return typeof input === "string" && /\.tsp$/i.test(input.trim());
}
