#!/usr/bin/env node
/**
 * Scaffold a new workspace package from `tooling/template/package/`.
 *
 *   pnpm new-package <pkg-name> <path>
 *
 * Example:
 *   pnpm new-package my-new-thing packages/openapi/my-new-thing
 *
 * Substitutes the placeholder tokens in the template files:
 *   __PKG_NAME__    → the bare name (e.g. "my-new-thing")
 *   __PKG_PATH__    → the workspace-relative path (e.g. "packages/openapi/my-new-thing")
 *   __DESCRIPTION__ → empty by default; edit after.
 *
 * Refuses to overwrite an existing directory.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const [, , pkgName, pkgPath] = process.argv;
if (!pkgName || !pkgPath) {
  console.error("usage: pnpm new-package <pkg-name> <path>");
  process.exit(2);
}

const ROOT = resolve(import.meta.dirname, "..");
const TEMPLATE = join(ROOT, "tooling/template/package");
const DEST = resolve(ROOT, pkgPath);

if (existsSync(DEST)) {
  console.error(`refusing to overwrite ${pkgPath} — directory exists`);
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });
cpSync(TEMPLATE, DEST, { recursive: true });

// Substitute placeholders in package.json.
const pkgJsonPath = join(DEST, "package.json");
const pkgJson = readFileSync(pkgJsonPath, "utf8")
  .replaceAll("__PKG_NAME__", pkgName)
  .replaceAll("__PKG_PATH__", pkgPath)
  .replaceAll("__DESCRIPTION__", "");
writeFileSync(pkgJsonPath, pkgJson);

console.log(`✓ scaffolded @ahmedrowaihi/${pkgName} at ${pkgPath}`);
console.log("  next:");
console.log("    1. set description + keywords in package.json");
console.log("    2. pnpm install");
console.log("    3. add the category to scripts/sync-readme.mjs");
console.log("    4. write your code in src/index.ts");
