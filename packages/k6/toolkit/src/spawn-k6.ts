import { type StdioOptions, spawn } from "node:child_process";

export interface K6FlagArgs {
  baseUrl?: string;
  vus?: string;
  duration?: string;
  /** k6 `--out` sinks. Each entry is a separate `--out` flag. */
  out?: ReadonlyArray<string>;
  /** k6 `--summary-export=<path>`. */
  summary?: string;
  /** Extra args appended verbatim after the synthesized flags. */
  extraArgs?: ReadonlyArray<string>;
}

/** Build the `k6 run …` argv for one bundle. */
export function buildK6Args(outfile: string, args: K6FlagArgs = {}): string[] {
  const out: string[] = ["run"];
  if (args.baseUrl) out.push("-e", `BASE_URL=${args.baseUrl}`);
  if (args.vus) out.push("--vus", args.vus);
  if (args.duration) out.push("--duration", args.duration);
  for (const sink of args.out ?? []) out.push("--out", sink);
  if (args.summary) out.push(`--summary-export=${args.summary}`);
  out.push(...(args.extraArgs ?? []));
  out.push(outfile);
  return out;
}

export interface SpawnK6Opts {
  /** Where to inherit/pipe k6's stdio. Default: "inherit". */
  stdio?: StdioOptions;
  /** Path/name of the k6 binary. Default: "k6". */
  binary?: string;
  /** Working directory. */
  cwd?: string;
}

/**
 * Spawn k6 with the given argv. Resolves to the exit code; for
 * signal-terminated processes returns `128 + signum` per POSIX so
 * callers can fail-fast on Ctrl-C / SIGKILL without manual signal
 * decoding.
 */
export function spawnK6(
  k6Args: ReadonlyArray<string>,
  opts: SpawnK6Opts = {},
): Promise<number> {
  const child = spawn(opts.binary ?? "k6", [...k6Args], {
    stdio: opts.stdio ?? "inherit",
    cwd: opts.cwd,
  });
  return new Promise((resolve, reject) => {
    child.on("exit", (code, signal) => {
      if (code !== null) return resolve(code);
      if (signal) return resolve(128 + (SIGNALS[signal] ?? 1));
      resolve(1);
    });
    child.on("error", reject);
  });
}

const SIGNALS: Record<string, number> = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGQUIT: 3,
  SIGKILL: 9,
  SIGTERM: 15,
};
