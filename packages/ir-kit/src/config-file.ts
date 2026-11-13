import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EXTENSIONS = [".ts", ".mts", ".js", ".mjs"];
let loads = 0;

/** `<name>.config.{ts,mts,js,mjs}` in `cwd`, or `undefined`. */
export function findConfigFile(cwd: string, name: string): string | undefined {
  return EXTENSIONS.map((ext) => join(cwd, `${name}.config${ext}`)).find(
    existsSync,
  );
}

/**
 * Import a config file's default export. TypeScript configs load through
 * Node's built-in type stripping. Each call reads the file again.
 */
export async function importConfig<T>(file: string): Promise<T> {
  const url = pathToFileURL(resolve(file));
  url.searchParams.set("t", `${Date.now()}-${++loads}`);
  const mod = (await import(url.href)) as { default?: T };
  return (mod.default ?? mod) as T;
}
