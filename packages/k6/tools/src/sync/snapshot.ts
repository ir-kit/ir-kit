import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { OperationMap } from "./operation-map.js";

export const SNAPSHOT_FILENAME = ".k6-spec-snapshot.json";

interface SnapshotShape {
  v: 1;
  operations: Record<string, string>;
}

export async function loadSnapshotOps(
  path: string,
): Promise<OperationMap | null> {
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(await readFile(path, "utf8")) as SnapshotShape;
    if (data?.v !== 1 || !data.operations) return null;
    return new Map(Object.entries(data.operations));
  } catch {
    return null;
  }
}

/** Persist the current op map for the next sync to diff against. */
export async function writeSnapshotOps(
  path: string,
  ops: OperationMap,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const payload: SnapshotShape = {
    v: 1,
    operations: Object.fromEntries(ops),
  };
  await writeFile(path, JSON.stringify(payload, null, 2));
}
