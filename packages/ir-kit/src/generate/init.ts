import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { TargetName } from "./config.js";

export const DEFAULT_OUTPUTS: Record<TargetName, string> = {
  go: "sdk/go",
  kotlin: "sdk/kotlin",
  swift: "sdk/swift",
  java: "sdk/java",
  typescript: "sdk/typescript",
  k6: "loadtest/client",
  docs: "docs/index.html",
  asyncapi: "sdk/events",
};

export interface WriteConfigOptions {
  cwd?: string;
  input: string;
  targets: ReadonlyArray<TargetName>;
  /** Replace an existing `ir.config.ts`. Default: `false`. */
  force?: boolean;
}

/** Write a starter `ir.config.ts` and return its path. */
export async function writeConfig(opts: WriteConfigOptions): Promise<string> {
  const file = join(resolve(opts.cwd ?? process.cwd()), "ir.config.ts");
  if (existsSync(file) && !opts.force) {
    throw new Error(`${file} already exists. Pass --force to replace it.`);
  }
  await writeFile(file, renderConfig(opts.input, opts.targets));
  return file;
}

export function renderConfig(
  input: string,
  targets: ReadonlyArray<TargetName>,
): string {
  const lines = targets.map(
    (name) =>
      `    ${name}: { output: ${JSON.stringify(DEFAULT_OUTPUTS[name])} },`,
  );
  return [
    'import { defineConfig } from "ir-kit";',
    "",
    "export default defineConfig({",
    `  input: ${JSON.stringify(input)},`,
    "  targets: {",
    ...lines,
    "  },",
    "});",
    "",
  ].join("\n");
}
