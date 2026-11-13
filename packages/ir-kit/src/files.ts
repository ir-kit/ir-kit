import { type FSWatcher, statSync, watch } from "node:fs";
import { glob } from "node:fs/promises";
import { isAbsolute, matchesGlob, relative, resolve, sep } from "node:path";

export const IGNORED = [
  "**/node_modules/**",
  "**/dist/**",
  "**/__fn_schema_virtual__/**",
];

export interface FileMatcher {
  include: string[];
  exclude: string[];
  /** The fixed directory each include pattern starts from, for watchers that take paths. */
  roots: string[];
  matches(file: string): boolean;
}

const toPosix = (p: string) => p.split(sep).join("/");
const isGlob = (p: string) => /[*?[\]{}]/.test(p);

/**
 * Turns user patterns into cwd-relative globs: `!pattern` excludes,
 * absolute paths become relative, and a plain directory means everything under it.
 */
export function fileMatcher(
  patterns: ReadonlyArray<string>,
  cwd: string,
  ignore: ReadonlyArray<string> = IGNORED,
): FileMatcher {
  const include: string[] = [];
  const exclude = [...ignore];
  for (const raw of patterns) {
    const negated = raw.startsWith("!");
    let p = negated ? raw.slice(1) : raw;
    if (isAbsolute(p)) p = toPosix(relative(cwd, p));
    if (
      !isGlob(p) &&
      statSync(resolve(cwd, p), { throwIfNoEntry: false })?.isDirectory()
    ) {
      const dir = p.replace(/\/+$/, "");
      p = dir && dir !== "." ? `${dir}/**` : "**";
    }
    (negated ? exclude : include).push(p);
  }
  const roots = include.map((p) => {
    const parts = p.split("/");
    const glob = parts.findIndex(isGlob);
    return resolve(cwd, ...(glob < 0 ? parts : parts.slice(0, glob)));
  });
  return {
    include,
    exclude,
    roots,
    matches(file) {
      const rel = toPosix(relative(cwd, resolve(cwd, file)));
      return (
        include.some((p) => matchesGlob(rel, p)) &&
        !exclude.some((p) => matchesGlob(rel, p))
      );
    },
  };
}

export async function globFiles(
  patterns: ReadonlyArray<string>,
  cwd: string,
  ignore: ReadonlyArray<string> = IGNORED,
): Promise<string[]> {
  const { include, exclude } = fileMatcher(patterns, cwd, ignore);
  const files = new Set<string>();
  for await (const entry of glob(include, {
    cwd,
    exclude,
    withFileTypes: true,
  })) {
    const file = resolve(entry.parentPath, entry.name);
    if (
      entry.isFile() ||
      (entry.isSymbolicLink() &&
        statSync(file, { throwIfNoEntry: false })?.isFile())
    ) {
      files.add(file);
    }
  }
  return [...files].sort();
}

export function watchFiles(
  patterns: ReadonlyArray<string>,
  cwd: string,
  onChange: (file: string) => void,
  ignore: ReadonlyArray<string> = IGNORED,
): FSWatcher {
  const matcher = fileMatcher(patterns, cwd, ignore);
  return watch(cwd, { recursive: true }, (_event, name) => {
    if (!name) return;
    const file = resolve(cwd, name.toString());
    if (matcher.matches(file)) onChange(file);
  });
}
