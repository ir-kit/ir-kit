import { spawn } from "node:child_process";

import { consola } from "consola";

import type { RunTarget } from "./targets.js";

export interface K6FlagArgs {
  "base-url"?: string;
  vus?: string;
  duration?: string;
  /** Comma-separated `--out` shorthand (`json=path,influxdb=...`). */
  out?: string;
  /** `--summary-export=<path>` shorthand. */
  summary?: string;
  /** Escape hatch — verbatim args appended after the synthesized flags. */
  "k6-arg"?: string | string[];
}

/** Build the `k6 run …` argv for a single bundled target. */
export function buildK6Args(target: RunTarget, args: K6FlagArgs): string[] {
  const out: string[] = ["run"];
  if (args["base-url"]) out.push("-e", `BASE_URL=${args["base-url"]}`);
  if (args.vus) out.push("--vus", args.vus);
  if (args.duration) out.push("--duration", args.duration);
  for (const target of splitCsv(args.out)) out.push("--out", target);
  if (args.summary) out.push(`--summary-export=${args.summary}`);
  out.push(...passthroughArgs(args["k6-arg"]));
  out.push(target.outfile);
  return out;
}

function splitCsv(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function passthroughArgs(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Spawn k6 with the given argv, inheriting stdio. Resolves to the exit code. */
export function runK6(target: RunTarget, k6Args: string[]): Promise<number> {
  consola.start(`[${target.name}] running: k6 ${k6Args.join(" ")}`);
  const child = spawn("k6", k6Args, { stdio: "inherit" });
  return new Promise((resolve, reject) => {
    child.on("exit", (code) => resolve(code ?? 0));
    child.on("error", reject);
  });
}
