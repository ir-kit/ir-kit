import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import {
  type CompilerHost,
  type CompilerOptions,
  compile,
  NodeHost,
} from "@typespec/compiler";

import type { CompileTypespecInput, CompileTypespecOptions } from "./index.js";

export interface CompileCaptureOptions extends CompileTypespecOptions {
  /** Emitter package name (e.g. `@typespec/json-schema`, `@typespec/protobuf`). */
  emitter: string;
  /** Options forwarded to the emitter under `options[emitter]`. */
  emitterOptions?: Record<string, unknown>;
}

export interface CompileCaptureResult {
  /** Captured files keyed by their RELATIVE path from the emitter's
   *  output dir. Empty string keys are flattened to filename only. */
  files: Record<string, string>;
}

/**
 * Compile a TypeSpec entry point with an arbitrary emitter, capturing
 * the emitter's `writeFile` calls in memory instead of writing to
 * disk. Use this when the emitter doesn't expose a `getX()` programmatic
 * API the way `@typespec/openapi3` does.
 */
export async function compileTypespecCapture(
  input: CompileTypespecInput,
  options: CompileCaptureOptions,
): Promise<CompileCaptureResult> {
  const { mainFile, cleanup } = await materialize(input, options.cwd);
  const captured = new Map<string, string>();
  const outputDir = resolve(options.cwd ?? process.cwd(), "__capture__");

  const host: CompilerHost = {
    ...NodeHost,
    writeFile: async (path: string, content: string) => {
      const rel = relative(outputDir, path);
      const key = rel.startsWith("..") || rel === "" ? path : rel;
      captured.set(key, content);
    },
    mkdirp: async () => undefined,
  };

  const compilerOptions: CompilerOptions = {
    emit: [options.emitter],
    outputDir,
    options: options.emitterOptions
      ? { [options.emitter]: options.emitterOptions }
      : undefined,
  };

  try {
    const program = await compile(host, mainFile, compilerOptions);
    const fatal = program.diagnostics.filter((d) => d.severity === "error");
    if (fatal.length > 0) {
      const lines = fatal.map((d) => `  - ${d.message}`).join("\n");
      throw new Error(`TypeSpec compilation failed:\n${lines}`);
    }
    return { files: Object.fromEntries(captured) };
  } finally {
    await cleanup();
  }
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
