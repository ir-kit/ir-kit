import type { IR } from "@ahmedrowaihi/openapi-tools";
import { describe, expect, it } from "vitest";

import { readSpecOperations, UNTAGGED } from "../src/scaffold/spec-tags.ts";

function makePaths(): IR.PathsObject {
  return {
    "/pets": {
      get: {
        id: "listPets",
        method: "get",
        path: "/pets",
        tags: ["pet"],
        responses: { 200: {} },
      },
      post: {
        id: "addPet",
        method: "post",
        path: "/pets",
        tags: ["pet"],
        responses: { 200: {} },
      },
    },
    "/users/{id}": {
      get: {
        id: "getUser",
        method: "get",
        path: "/users/{id}",
        tags: ["user"],
        responses: { 200: {} },
      },
    },
    "/health": {
      get: {
        id: "health",
        method: "get",
        path: "/health",
        // No tags
        responses: { 200: {} },
      },
    },
  } as unknown as IR.PathsObject;
}

describe("readSpecOperations", () => {
  it("buckets ops by tag", () => {
    const spec = readSpecOperations(makePaths());
    expect(spec.byTag.get("pet")?.map((o) => o.id)).toEqual([
      "listPets",
      "addPet",
    ]);
    expect(spec.byTag.get("user")?.map((o) => o.id)).toEqual(["getUser"]);
  });

  it("groups untagged ops under `_untagged`", () => {
    const spec = readSpecOperations(makePaths());
    expect(spec.byTag.get(UNTAGGED)?.map((o) => o.id)).toEqual(["health"]);
  });

  it("exposes a flat byId map for direct lookup", () => {
    const spec = readSpecOperations(makePaths());
    expect(spec.byId.get("getUser")?.method).toBe("get");
    expect(spec.byId.get("addPet")?.method).toBe("post");
  });

  it("preserves spec order in `all`", () => {
    const spec = readSpecOperations(makePaths());
    expect(spec.all.map((o) => o.id)).toEqual([
      "listPets",
      "addPet",
      "getUser",
      "health",
    ]);
  });

  it("handles an empty/missing paths object", () => {
    const spec = readSpecOperations(undefined);
    expect(spec.all).toEqual([]);
    expect(spec.byTag.size).toBe(0);
    expect(spec.byId.size).toBe(0);
  });

  it("places an op carrying multiple tags into each tag's bucket", () => {
    const multi = {
      "/cross": {
        get: {
          id: "crossOp",
          method: "get",
          path: "/cross",
          tags: ["pet", "user"],
          responses: { 200: {} },
        },
      },
    } as unknown as IR.PathsObject;
    const spec = readSpecOperations(multi);
    expect(spec.byTag.get("pet")?.map((o) => o.id)).toEqual(["crossOp"]);
    expect(spec.byTag.get("user")?.map((o) => o.id)).toEqual(["crossOp"]);
    expect(spec.all.map((o) => o.id)).toEqual(["crossOp"]);
  });
});
