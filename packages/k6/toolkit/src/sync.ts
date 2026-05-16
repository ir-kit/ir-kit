import { join, resolve } from "node:path";

import {
  type GenerateOptions,
  type GenerateResult,
  generate,
} from "@ahmedrowaihi/k6-gen";

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
  const output = resolve(opts.output);
  const snapshotPath = join(output, SNAPSHOT_FILENAME);

  const prevOps = opts.reportRenames
    ? await loadSnapshotOps(snapshotPath)
    : null;

  const result = await generate({
    input: opts.input,
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
