#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { resolve } from "node:path";

import { bundle } from "./bundle.js";
import { runScaffoldCommand } from "./scaffold/cli-handler.js";
import { runSyncCommand } from "./sync-cli.js";

const CACHE_DIR = ".k6-ts-cache";

/**
 * Find the entry .ts file in the args. Walks right-to-left so the script's
 * position (typically the last positional) wins over earlier flag values like
 * `-e VAR=path.ts`.
 */
function findTsEntry(
  args: ReadonlyArray<string>,
): { index: number; path: string } | null {
  for (let i = args.length - 1; i >= 0; i--) {
    const a = args[i];
    if (a.startsWith("-")) continue;
    if (a.includes("=")) continue;
    if (!a.endsWith(".ts")) continue;
    if (!existsSync(resolve(a))) continue;
    return { index: i, path: a };
  }
  return null;
}

function signalToExitCode(signal: NodeJS.Signals): number {
  const signum =
    (osConstants.signals as Record<string, number | undefined>)[signal] ?? 1;
  return 128 + signum;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args[0] === "scaffold") {
    await runScaffoldCommand(args.slice(1));
    return;
  }

  if (args[0] === "sync") {
    await runSyncCommand(args.slice(1));
    return;
  }

  let toExec: ReadonlyArray<string> = args;

  const tsEntry = findTsEntry(args);
  if (tsEntry) {
    try {
      const { outfile } = await bundle({
        entry: resolve(tsEntry.path),
        outDir: CACHE_DIR,
      });
      toExec = [
        ...args.slice(0, tsEntry.index),
        outfile,
        ...args.slice(tsEntry.index + 1),
      ];
    } catch (err) {
      console.error(
        `k6-ts: bundle failed for ${tsEntry.path}:`,
        err instanceof Error ? err.message : err,
      );
      process.exit(1);
    }
  }

  const child = spawn("k6", [...toExec], { stdio: "inherit" });

  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as NodeJS.Signals[]) {
    process.on(sig, () => {
      if (!child.killed) child.kill(sig);
    });
  }

  child.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(
        "k6-ts: k6 binary not found on PATH. Install it from https://k6.io/docs/get-started/installation/",
      );
      process.exit(127);
    }
    console.error("k6-ts: failed to spawn k6:", err.message);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) process.exit(signalToExitCode(signal));
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error("k6-ts:", err instanceof Error ? err.message : err);
  process.exit(1);
});
