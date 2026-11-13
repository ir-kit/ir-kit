import { existsSync, readFileSync } from "node:fs";
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
  if (file.endsWith(".ts") && ESM_SYNTAX.test(readFileSync(file, "utf8"))) {
    loadAsModule(url.href);
  }
  url.searchParams.set("t", `${Date.now()}-${++loads}`);
  const mod = (await import(url.href)) as { default?: T };
  return (mod.default ?? mod) as T;
}

const ESM_SYNTAX = /^\s*(import|export)\b/m;
const moduleConfigs = new Set<string>();

// why: without "type": "module" Node parses an ESM .ts config twice and warns.
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
