import type { OperationMap } from "./operation-map.js";

export interface RenameEntry {
  method: string;
  path: string;
  from: string;
  to: string;
}

export interface OperationDiff {
  /** Same (method, path) — operationId changed. */
  renamed: RenameEntry[];
  /** Endpoints that existed before but no longer do. */
  removed: Array<{ method: string; path: string; operationId: string }>;
  /** Endpoints that didn't exist before. */
  added: Array<{ method: string; path: string; operationId: string }>;
}

/** Diff two op-id maps. Rename = same (method, path), different operationId. */
export function diffOperationIds(
  prev: OperationMap,
  next: OperationMap,
): OperationDiff {
  const renamed: RenameEntry[] = [];
  const removed: OperationDiff["removed"] = [];
  const added: OperationDiff["added"] = [];

  for (const [key, prevId] of prev) {
    const nextId = next.get(key);
    if (!nextId) {
      const [method, path] = splitKey(key);
      removed.push({ method, path, operationId: prevId });
      continue;
    }
    if (nextId !== prevId) {
      const [method, path] = splitKey(key);
      renamed.push({ method, path, from: prevId, to: nextId });
    }
  }
  for (const [key, nextId] of next) {
    if (prev.has(key)) continue;
    const [method, path] = splitKey(key);
    added.push({ method, path, operationId: nextId });
  }

  return { renamed, removed, added };
}

function splitKey(key: string): [string, string] {
  const i = key.indexOf(" ");
  return [key.slice(0, i), key.slice(i + 1)];
}
