import { readFileSync } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { findConfigFile } from "../config-file.js";

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
  /** Replace an existing `ir.config.*`. Default: `false`. */
  force?: boolean;
}

/**
 * Write a starter config and return its path: `ir.config.ts` in an ES module
 * package, otherwise `ir.config.mts`.
 */
export async function writeConfig(opts: WriteConfigOptions): Promise<string> {
  const cwd = resolve(opts.cwd ?? process.cwd());
  const existing = findConfigFile(cwd, "ir");
  if (existing && !opts.force) {
    throw new Error(`${existing} already exists. Pass --force to replace it.`);
  }
  const file = join(
    cwd,
    isModulePackage(cwd) ? "ir.config.ts" : "ir.config.mts",
  );
  if (existing && existing !== file) await rm(existing);
  await writeFile(file, renderConfig(opts.input, opts.targets));
  return file;
}

function isModulePackage(dir: string): boolean {
  for (let at = dir; ; at = dirname(at)) {
    try {
      const pkg = JSON.parse(readFileSync(join(at, "package.json"), "utf8"));
      return pkg.type === "module";
    } catch {
      if (dirname(at) === at) return false;
    }
  }
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
