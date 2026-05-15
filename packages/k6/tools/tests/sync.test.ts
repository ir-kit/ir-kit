import { describe, expect, it } from "vitest";

import { diffOperationIds } from "../src/sync/rename-report.ts";

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
      ["GET /pets/{id}", "getPet"], // added
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
