#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, ".output", "chrome-mv3");
const installTarget = join(homedir(), "Applications", "Glean");

if (!existsSync(dist)) {
  console.error(`No build at ${dist}. Run \`pnpm build\` first.`);
  process.exit(1);
}

// Wipe + copy: removes stale files (deleted in source but lingering in target).
rmSync(installTarget, { recursive: true, force: true });
mkdirSync(installTarget, { recursive: true });
cpSync(dist, installTarget, { recursive: true });

console.log(`\nGlean installed to ${installTarget}`);
console.log(
  "First-run: chrome://extensions/ → Developer Mode → Load unpacked → pick the dir above.",
);
console.log("After that: just click Reload on the Glean card.\n");
