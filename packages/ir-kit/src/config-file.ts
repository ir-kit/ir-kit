import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
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
  if (url.pathname.endsWith(".ts")) loadAsModule(url.href);
  url.searchParams.set("t", `${Date.now()}-${++loads}`);
  const mod = (await import(url.href)) as { default?: T };
  return (mod.default ?? mod) as T;
}

const moduleConfigs = new Set<string>();

/**
 * Load `<name>.config.ts` as an ES module even when the nearest package.json
 * has no `"type": "module"`, so `ir init` works in a fresh `npm init` folder
 * without Node's reparse warning.
 */
function loadAsModule(href: string): void {
  if (moduleConfigs.size === 0) {
    registerHooks({
      load(url, context, nextLoad) {
        const bare = url.split("?")[0] ?? url;
        return moduleConfigs.has(bare)
          ? nextLoad(url, { ...context, format: "module-typescript" })
          : nextLoad(url, context);
      },
    });
  }
  moduleConfigs.add(href);
}
