import { resolve } from "node:path";

import { type BundleOpts, bundle } from "./bundle.js";
import {
  buildK6Args,
  type K6FlagArgs,
  type SpawnK6Opts,
  spawnK6,
} from "./spawn-k6.js";

export interface RunK6Options extends K6FlagArgs {
  /** Source entry to bundle. Required. */
  entry: string;
  /** Extra bundler options forwarded to tsdown. `entry` from here is ignored. */
  bundle?: Omit<BundleOpts, "entry">;
  /** Where to spawn from. Default: process.cwd(). */
  cwd?: string;
  /** Path/name of the k6 binary. Default: "k6". */
  binary?: string;
  /** Inherit/pipe k6 stdio. Default: "inherit". */
  stdio?: SpawnK6Opts["stdio"];
}

export interface RunK6Result {
  /** Exit code; signal-killed processes resolve to `128 + signum`. */
  exitCode: number;
  /** Where the bundle was written. */
  outfile: string;
}

/**
 * Bundle a k6 loadtest with tsdown, then spawn the k6 binary against
 * the resulting file. One call covers what `k6-tools run` does at the
 * CLI level.
 */
export async function runK6(opts: RunK6Options): Promise<RunK6Result> {
  const cwd = opts.cwd ?? process.cwd();
  const { outfile } = await bundle({
    ...(opts.bundle ?? {}),
    entry: resolve(cwd, opts.entry),
  });

  const k6Args = buildK6Args(outfile, {
    baseUrl: opts.baseUrl,
    vus: opts.vus,
    duration: opts.duration,
    out: opts.out,
    summary: opts.summary,
    extraArgs: opts.extraArgs,
  });

  const exitCode = await spawnK6(k6Args, {
    binary: opts.binary,
    cwd,
    stdio: opts.stdio,
  });

  return { exitCode, outfile };
}
