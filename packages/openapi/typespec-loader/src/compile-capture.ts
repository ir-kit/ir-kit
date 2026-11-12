import { relative, resolve } from "node:path";

import {
  type CompilerHost,
  type CompilerOptions,
  NodeHost,
} from "@typespec/compiler";

import { type CompileTypespecInput, withProgram } from "./compile.js";
import type { CompileTypespecOptions } from "./index.js";

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

  return withProgram(
    input,
    options.cwd,
    compilerOptions,
    () => ({ files: Object.fromEntries(captured) }),
    host,
  );
}
