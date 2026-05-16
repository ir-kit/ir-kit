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
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(
      `Failed to read snapshot at ${path}: ${(err as Error).message}`,
    );
  }

  let data: SnapshotShape;
  try {
    data = JSON.parse(raw) as SnapshotShape;
  } catch (err) {
    throw new Error(
      `Malformed snapshot at ${path}: ${(err as Error).message}. Delete the file to regenerate.`,
    );
  }

  if (data?.v !== 1 || !data.operations) {
    throw new Error(
      `Unrecognized snapshot schema at ${path} (expected v=1). Delete the file to regenerate.`,
    );
  }
  return new Map(Object.entries(data.operations));
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
