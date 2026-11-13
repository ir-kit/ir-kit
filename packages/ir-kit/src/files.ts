import { type FSWatcher, watch } from "node:fs";
import { glob } from "node:fs/promises";
import { matchesGlob, relative, resolve, sep } from "node:path";

export const IGNORED = [
  "**/node_modules/**",
  "**/dist/**",
  "**/__fn_schema_virtual__/**",
];

/** Absolute paths of files under `cwd` matching `patterns`. */
export async function globFiles(
  patterns: ReadonlyArray<string>,
  cwd: string,
  ignore: ReadonlyArray<string> = IGNORED,
): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob([...patterns], {
    cwd,
    exclude: [...ignore],
    withFileTypes: true,
  })) {
    if (entry.isFile()) files.push(resolve(entry.parentPath, entry.name));
  }
  return files.sort();
}

/**
 * Call `onChange` with the absolute path of every file under `cwd` that
 * matches `patterns` when it is added, changed or removed.
 */
export function watchFiles(
  patterns: ReadonlyArray<string>,
  cwd: string,
  onChange: (file: string) => void,
  ignore: ReadonlyArray<string> = IGNORED,
): FSWatcher {
  const matches = (rel: string) =>
    patterns.some((p) => matchesGlob(rel, p)) &&
    !ignore.some((p) => matchesGlob(rel, p));
  return watch(cwd, { recursive: true }, (_event, name) => {
    if (!name) return;
    const file = resolve(cwd, name.toString());
    if (matches(relative(cwd, file).split(sep).join("/"))) onChange(file);
  });
}
