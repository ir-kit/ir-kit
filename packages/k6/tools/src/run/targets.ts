import { basename, dirname, extname, resolve } from "node:path";

import { consola } from "consola";
import { glob } from "tinyglobby";

import type { K6ToolsConfig } from "../config.js";

export interface RunTarget {
  /** Display name in logs ("default" for the single-loadtest case). */
  name: string;
  /** Absolute path to the source entry. */
  entry: string;
  /** Absolute path to the bundle output. */
  outfile: string;
}

export interface RunArgs {
  entry?: string;
  outfile?: string;
  pattern?: string;
  name?: string | string[];
}

// Precedence: positional entry → --pattern glob → config.loadtests
// (filtered by --name) → config.loadtest → ./loadtest.ts.
export async function resolveTargets(
  cwd: string,
  args: RunArgs,
  config: K6ToolsConfig,
): Promise<RunTarget[]> {
  const outBase = resolve(cwd, args.outfile ?? "./dist/loadtest.js");
  const outDir = dirname(outBase);

  if (args.entry) {
    return [
      { name: "default", entry: resolve(cwd, args.entry), outfile: outBase },
    ];
  }

  if (args.pattern) {
    const matches = await glob(args.pattern, { cwd, absolute: true });
    matches.sort();
    return matches.map((entry: string) => ({
      name: stem(entry),
      entry,
      outfile: bundlePath(outDir, entry),
    }));
  }

  if (config.loadtests && Object.keys(config.loadtests).length > 0) {
    return resolveNamed(cwd, config.loadtests, args.name, outDir);
  }

  return [
    {
      name: "default",
      entry: resolve(cwd, config.loadtest ?? "./loadtest.ts"),
      outfile: outBase,
    },
  ];
}

function resolveNamed(
  cwd: string,
  loadtests: Record<string, string>,
  nameArg: string | string[] | undefined,
  outDir: string,
): RunTarget[] {
  const wanted =
    typeof nameArg === "string"
      ? [nameArg]
      : Array.isArray(nameArg)
        ? nameArg
        : [];

  const entries = wanted.length
    ? wanted.map((n) => {
        const path = loadtests[n];
        if (!path) {
          consola.error(`No loadtest named "${n}" in config.loadtests.`);
          process.exit(1);
        }
        return [n, path] as const;
      })
    : Object.entries(loadtests);

  return entries.map(([name, path]) => ({
    name,
    entry: resolve(cwd, path),
    outfile: bundlePath(outDir, resolve(cwd, path), name),
  }));
}

function stem(entry: string): string {
  return basename(entry, extname(entry));
}

function bundlePath(outDir: string, entry: string, name?: string): string {
  return resolve(outDir, `${name ?? stem(entry)}.js`);
}
