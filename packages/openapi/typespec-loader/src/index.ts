import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type CompilerOptions, compile, NodeHost } from "@typespec/compiler";
import {
  getOpenAPI3,
  type SupportedOpenAPIDocuments,
} from "@typespec/openapi3";

export type CompileTypespecInput =
  | { source: string; imports?: ReadonlyArray<string> }
  | { path: string };

export type CompileTypespecOptions = {
  cwd?: string;
  openapi?: Record<string, unknown>;
};

export type OpenAPIDocument = SupportedOpenAPIDocuments;

export type CompileTypespecResult = {
  documents: ReadonlyArray<OpenAPIDocument>;
  document: OpenAPIDocument;
};

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

  const { mainFile, cleanup } = await materialize(input, options.cwd);
  try {
    const program = await compile(NodeHost, mainFile, compilerOptions);
    const fatal = program.diagnostics.filter((d) => d.severity === "error");
    if (fatal.length > 0) {
      const lines = fatal.map((d) => `  - ${d.message}`).join("\n");
      throw new Error(`TypeSpec compilation failed:\n${lines}`);
    }

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
  } finally {
    await cleanup();
  }
}

/** `true` when `input` is a string path ending in `.tsp` (case-insensitive). */
export function isTypespecPath(input: unknown): input is string {
  return typeof input === "string" && /\.tsp$/i.test(input.trim());
}

async function materialize(
  input: CompileTypespecInput,
  cwd: string | undefined,
): Promise<{ mainFile: string; cleanup: () => Promise<void> }> {
  if ("path" in input) {
    return {
      mainFile: resolve(cwd ?? process.cwd(), input.path),
      cleanup: async () => {},
    };
  }

  const base = cwd ?? process.cwd();
  const dir = await mkdtemp(join(base, ".ir-kit-typespec-"));
  const mainFile = join(dir, "main.tsp");
  const imports = (input.imports ?? []).map((m) => `import "${m}";`).join("\n");
  const body = imports ? `${imports}\n\n${input.source}` : input.source;
  await writeFile(mainFile, body);
  return {
    mainFile,
    cleanup: () => rm(dir, { recursive: true, force: true }),
  };
}
