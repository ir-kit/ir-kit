import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const workspace = JSON.parse(
  execSync("pnpm -r ls --depth -1 --json", { encoding: "utf8" }),
);

const resolveTarget = (entry) =>
  typeof entry === "string"
    ? entry
    : entry &&
      (resolveTarget(entry.import) ||
        resolveTarget(entry.node) ||
        resolveTarget(entry.default));

const entryPoints = (manifest) => {
  const exports = manifest.exports ?? manifest.module ?? manifest.main;
  if (!exports) return [];
  if (
    typeof exports === "string" ||
    !Object.keys(exports).some((key) => key.startsWith("."))
  ) {
    return [[".", exports]];
  }
  return Object.entries(exports).filter(
    ([subpath]) => !subpath.includes("*") && !subpath.endsWith(".json"),
  );
};

const failures = [];
let loaded = 0;
for (const { name, path } of workspace) {
  const manifest = JSON.parse(readFileSync(join(path, "package.json"), "utf8"));
  if (manifest.private) continue;
  for (const [subpath, entry] of entryPoints(manifest)) {
    const target = resolveTarget(entry);
    if (!target || !/\.[cm]?js$/.test(target)) continue;
    const specifier = subpath === "." ? name : `${name}${subpath.slice(1)}`;
    try {
      await import(pathToFileURL(join(path, target)).href);
      loaded++;
    } catch (error) {
      failures.push(`${specifier}: ${error.message.split("\n")[0]}`);
    }
  }
}

for (const failure of failures) console.error(`✖ ${failure}`);
console.log(
  `${loaded} entry points load under Node ESM, ${failures.length} fail.`,
);
process.exit(failures.length ? 1 : 0);
