import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { convertSpec } from "../src/index.js";
import { findConverterPath } from "../src/registry.js";

const fixtures = join(import.meta.dirname, "fixtures");
let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "spec-convert-"));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("convertSpec", () => {
  it("rejects input that is not an API spec", async () => {
    const path = join(dir, "package.json");
    await writeFile(path, '{ "name": "pkg" }');
    await expect(convertSpec({ input: path, to: "openapi3" })).rejects.toThrow(
      "Unrecognized spec",
    );
  });

  it("detects a Postman collection by content, not file name", async () => {
    const path = join(dir, "collection.json");
    await writeFile(
      path,
      JSON.stringify({
        info: {
          name: "c",
          schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        item: [],
      }),
    );
    const result = await convertSpec({ input: path, to: "openapi3" });
    expect(result.from).toBe("postman");
  });

  it("passes a Postman collection through when the target is postman", async () => {
    const path = join(dir, "collection.json");
    const result = await convertSpec({ input: path, to: "postman" });
    expect(result.output).toMatchObject({
      kind: "document",
      document: { info: { name: "c" } },
    });
  });

  it("converts proto to OpenAPI", async () => {
    const result = await convertSpec({
      input: join(fixtures, "petstore.proto"),
      to: "openapi3",
    });
    expect(result.output.kind).toBe("document");
  });
});

describe("findConverterPath", () => {
  it("does not route OpenAPI to proto through generated TypeSpec", () => {
    expect(findConverterPath("openapi3", "proto")).toBeUndefined();
  });

  it("still routes TypeSpec to proto directly", () => {
    expect(findConverterPath("typespec", "proto")?.map((e) => e.to)).toEqual([
      "proto",
    ]);
  });
});
