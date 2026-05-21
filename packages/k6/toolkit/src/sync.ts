import { join, resolve } from "node:path";

import {
  type GenerateOptions,
  type GenerateResult,
  generate,
} from "@ir-kit/k6-gen";
import { resolveSpecInput } from "@ir-kit/openapi-tools";

import { extractOperationMap } from "./operation-map.js";
import { diffOperationIds, type OperationDiff } from "./rename-report.js";
import {
  loadSnapshotOps,
  SNAPSHOT_FILENAME,
  writeSnapshotOps,
} from "./snapshot.js";

export interface SyncOptions
  extends Pick<
    GenerateOptions,
    "input" | "normalize" | "defaultBaseUrl" | "scaffold" | "dryRun"
  > {
  /** Output directory for the generated client. */
  output: string;
  /** Working directory used to resolve relative `input` / `output`. Default: `process.cwd()`. */
  cwd?: string;
  /** Diff operationIds against the prior sync's snapshot. */
  reportRenames?: boolean;
  /** Persist a fresh snapshot after generate. Default: `true`. */
  writeSnapshot?: boolean;
}

export interface SyncResult extends GenerateResult {
  /** Drift summary; populated only when `reportRenames` is true. */
  diff?: OperationDiff;
}

/**
 * Drive {@link generate} from a spec to an output directory, plus the
 * snapshot bookkeeping that powers `--report-renames`. Returns the full
 * `GenerateResult` (files + ir) so callers can chain.
 */
export async function sync(opts: SyncOptions): Promise<SyncResult> {
  const cwd = opts.cwd ?? process.cwd();
  const output = resolve(cwd, opts.output);
  const input = resolveSpecInput(opts.input, cwd);
  const snapshotPath = join(output, SNAPSHOT_FILENAME);

  const prevOps = opts.reportRenames
    ? await loadSnapshotOps(snapshotPath)
    : null;

  const result = await generate({
    input,
    output,
    normalize: opts.normalize,
    defaultBaseUrl: opts.defaultBaseUrl,
    scaffold: opts.scaffold,
    dryRun: opts.dryRun,
  });

  const nextOps = extractOperationMap(result.ir);
  if (!opts.dryRun && opts.writeSnapshot !== false) {
    await writeSnapshotOps(snapshotPath, nextOps);
  }

  const diff = opts.reportRenames
    ? diffOperationIds(prevOps ?? new Map(), nextOps)
    : undefined;

  return { ...result, diff };
}
