import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { IR } from "@ahmedrowaihi/openapi-tools";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { extractOperationMap } from "../src/sync/operation-map.ts";
import { diffOperationIds } from "../src/sync/rename-report.ts";
import { loadSnapshotOps } from "../src/sync/snapshot.ts";

const prev = new Map([
  ["GET /pets", "listPets"],
  ["POST /pets", "createPet"],
  ["DELETE /pets/{id}", "deletePet"],
]);

describe("diffOperationIds", () => {
  it("flags same-route operationId changes as renamed", () => {
    const next = new Map(prev);
    next.set("GET /pets", "assetsList");

    const diff = diffOperationIds(prev, next);
    expect(diff.renamed).toEqual([
      { method: "GET", path: "/pets", from: "listPets", to: "assetsList" },
    ]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });

  it("reports added + removed when routes disappear or appear", () => {
    const next = new Map([
      ["GET /pets", "listPets"],
      ["GET /pets/{id}", "getPet"],
    ]);

    const diff = diffOperationIds(prev, next);
    expect(diff.added.map((a) => a.operationId)).toEqual(["getPet"]);
    expect(diff.removed.map((r) => r.operationId).sort()).toEqual([
      "createPet",
      "deletePet",
    ]);
    expect(diff.renamed).toEqual([]);
  });

  it("returns empty diffs when nothing changed", () => {
    const diff = diffOperationIds(prev, new Map(prev));
    expect(diff.renamed).toEqual([]);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });
});

describe("extractOperationMap", () => {
  it("trims operationIds and drops whitespace-only entries", () => {
    const ir = {
      paths: {
        "/a": { get: { operationId: "  getA  " } },
        "/b": { get: { operationId: "   " } },
        "/c": { get: { operationId: "" } },
        "/d": { get: {} },
      },
    } as unknown as IR.Model;

    const map = extractOperationMap(ir);
    expect(Object.fromEntries(map)).toEqual({ "GET /a": "getA" });
  });
});

describe("loadSnapshotOps", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "k6-snapshot-test-"));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns null when the snapshot file is missing", async () => {
    expect(await loadSnapshotOps(join(dir, "absent.json"))).toBeNull();
  });

  it("throws when the snapshot is malformed JSON (not silently null)", async () => {
    const path = join(dir, "snap.json");
    await writeFile(path, "{not valid json");
    await expect(loadSnapshotOps(path)).rejects.toThrow(/Malformed snapshot/);
  });

  it("throws on an unrecognized schema version", async () => {
    const path = join(dir, "snap.json");
    await writeFile(path, JSON.stringify({ v: 999, operations: {} }));
    await expect(loadSnapshotOps(path)).rejects.toThrow(
      /Unrecognized snapshot schema/,
    );
  });

  it("round-trips a valid v=1 snapshot", async () => {
    const path = join(dir, "snap.json");
    await writeFile(
      path,
      JSON.stringify({ v: 1, operations: { "GET /pets": "listPets" } }),
    );
    const map = await loadSnapshotOps(path);
    expect(map).not.toBeNull();
    expect(Object.fromEntries(map!)).toEqual({ "GET /pets": "listPets" });
  });
});
