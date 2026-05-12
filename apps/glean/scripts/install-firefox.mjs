#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, ".output", "firefox-mv2");
const installTarget = join(homedir(), "Applications", "Glean-Firefox");

if (!existsSync(dist)) {
  console.error(`No build at ${dist}. Run \`pnpm build:firefox\` first.`);
  process.exit(1);
}

rmSync(installTarget, { recursive: true, force: true });
mkdirSync(installTarget, { recursive: true });
cpSync(dist, installTarget, { recursive: true });

console.log(`\nGlean installed to ${installTarget}`);
console.log(
  "First-run: about:debugging#/runtime/this-firefox → Load Temporary Add-on → pick any file in the dir above.",
);
console.log("After that: just click Reload on the entry.\n");
