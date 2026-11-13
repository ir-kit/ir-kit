import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
  CompilerHost,
  CompilerOptions,
  Program,
} from "@typespec/compiler";

import { loadOptional } from "../../optional.js";

export const loadTypespecCompiler = () =>
  loadOptional(() => import("@typespec/compiler"), "TypeSpec input", [
    "@typespec/compiler",
    "@typespec/openapi3",
  ]);

export type CompileTypespecInput =
  | { source: string; imports?: ReadonlyArray<string> }
  | { path: string };

/**
 * Compile `input` (writing inline source to a temp `main.tsp` first),
 * throw on error diagnostics, and hand the program to `use`.
 */
export async function withProgram<T>(
  input: CompileTypespecInput,
  cwd: string | undefined,
  options: CompilerOptions,
  use: (program: Program) => Promise<T> | T,
  host?: CompilerHost,
): Promise<T> {
  const { compile, NodeHost } = await loadTypespecCompiler();
  const { mainFile, cleanup } = await materialize(input, cwd);
  try {
    const program = await compile(host ?? NodeHost, mainFile, options);
    const fatal = program.diagnostics.filter((d) => d.severity === "error");
    if (fatal.length > 0) {
      const lines = fatal.map((d) => `  - ${d.message}`).join("\n");
      throw new Error(`TypeSpec compilation failed:\n${lines}`);
    }
    return await use(program);
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
