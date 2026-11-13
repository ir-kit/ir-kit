import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";

import type { IrConfig, TargetName } from "./config.js";
import { loadOpenAPIForSdk } from "./load-openapi.js";
import { TARGET_NAMES, type Target, targets } from "./targets.js";

export interface RunOptions {
  /** Base for relative paths in the config. Default: `process.cwd()`. */
  cwd?: string;
  /** Only run these targets. Default: every target in the config. */
  only?: ReadonlyArray<string>;
  /**
   * Generate into a temporary directory and compare with what is on disk
   * instead of writing. Each result lists the files that differ.
   */
  check?: boolean;
}

export interface TargetResult {
  target: TargetName;
  /** Absolute path of the target's output. */
  output: string;
  /** With `check`: files that are out of date, as `changed: <path>`, `missing: <path>` or `extra: <path>`. */
  stale: string[];
}

const isUrl = (value: string) => /^https?:\/\//i.test(value);

/** Run every target in `config`, in the order they are listed. */
export async function generate(
  config: IrConfig,
  opts: RunOptions = {},
): Promise<TargetResult[]> {
  const cwd = resolve(opts.cwd ?? process.cwd());
  const selected = selectTargets(config, opts.only);
  const docs = new Map<string, Promise<Record<string, unknown>>>();
  const loadOpenAPI = (input: string) => {
    if (!docs.has(input)) docs.set(input, loadOpenAPIForSdk(input));
    return docs.get(input)!;
  };

  const results: TargetResult[] = [];
  for (const name of selected) {
    const { input: ownInput, output, ...options } = config.targets[name]!;
    const rawInput = ownInput ?? config.input;
    if (!rawInput) {
      throw new Error(
        `Target ${name} has no input. Set "input" at the top of the config or on the target.`,
      );
    }
    if (!output) throw new Error(`Target ${name} needs an "output".`);
    if (config.normalize && targets[name].options.includes("normalize")) {
      (options as Record<string, unknown>).normalize ??= true;
    }
    const input = isUrl(rawInput) ? rawInput : resolve(cwd, rawInput);
    const out = resolve(cwd, output);
    const target = targets[name];
    const run = (dest: string) =>
      target.run({ input, output: dest, options, loadOpenAPI });

    if (!opts.check) {
      await run(out);
      results.push({ target: name, output: out, stale: [] });
      continue;
    }
    const tmp = await mkdtemp(join(tmpdir(), `ir-check-${name}-`));
    try {
      const fresh = join(tmp, basename(out));
      await run(fresh);
      const stale = target.file
        ? await compareFile(fresh, out)
        : await compareDirs(fresh, out, target, options);
      results.push({ target: name, output: out, stale });
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }
  return results;
}

function selectTargets(
  config: IrConfig,
  only: ReadonlyArray<string> | undefined,
): TargetName[] {
  const configured = Object.keys(config.targets ?? {});
  for (const name of [...configured, ...(only ?? [])]) {
    if (!(TARGET_NAMES as ReadonlyArray<string>).includes(name)) {
      throw new Error(
        `Unknown target "${name}". Available: ${TARGET_NAMES.join(", ")}`,
      );
    }
  }
  for (const name of only ?? []) {
    if (!configured.includes(name)) {
      throw new Error(`Target "${name}" is not in the config.`);
    }
  }
  for (const name of configured as TargetName[]) {
    const known = ["input", "output", ...targets[name].options];
    for (const key of Object.keys(config.targets[name] ?? {})) {
      if (!known.includes(key)) {
        throw new Error(
          `Unknown option "${key}" on target ${name}. Known: ${known.join(", ")}`,
        );
      }
    }
  }
  return (only ?? configured) as TargetName[];
}

async function compareFile(fresh: string, current: string): Promise<string[]> {
  const name = basename(current);
  if (!existsSync(current)) return [`missing: ${name}`];
  const [a, b] = await Promise.all([readFile(fresh), readFile(current)]);
  return a.equals(b) ? [] : [`changed: ${name}`];
}

async function compareDirs(
  fresh: string,
  current: string,
  target: Target,
  options: Record<string, unknown>,
): Promise<string[]> {
  const owned = (path: string) => !target.userOwned?.(path);
  const freshFiles = (await listFiles(fresh)).filter(owned);
  const currentFiles = new Set((await listFiles(current)).filter(owned));
  const stale: string[] = [];
  for (const path of freshFiles) {
    if (!currentFiles.has(path)) {
      stale.push(`missing: ${path}`);
      continue;
    }
    currentFiles.delete(path);
    const [a, b] = await Promise.all([
      readFile(join(fresh, path)),
      readFile(join(current, path)),
    ]);
    if (!a.equals(b)) stale.push(`changed: ${path}`);
  }
  if (target.cleans(options)) {
    for (const path of currentFiles) stale.push(`extra: ${path}`);
  }
  return stale.sort();
}

async function listFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(dir, join(entry.parentPath, entry.name)).replaceAll("\\", "/"),
    );
}
