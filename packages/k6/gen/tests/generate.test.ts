import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { generate } from "../src/index.ts";

const SPEC = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../fixtures/petstore.yaml",
);

describe("@ahmedrowaihi/k6-gen", () => {
  let outDir: string;
  let files: Record<string, string>;

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), "k6-gen-test-"));
    const result = await generate({
      input: SPEC,
      output: outDir,
      normalize: true,
    });
    files = Object.fromEntries(result.files.map((f) => [f.path, f.content]));
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it("emits the four artifact files", async () => {
    const written = await readdir(outDir);
    expect(written.sort()).toEqual([
      "client.ts",
      "data.ts",
      "index.ts",
      "types.ts",
    ]);
  });

  it("client.ts imports framework runtime + k6/http", () => {
    expect(files["client.ts"]).toMatch(/from "k6\/http"/);
    expect(files["client.ts"]).toMatch(
      /applyMiddlewareHeaders.*from "@ahmedrowaihi\/k6\/runtime"/s,
    );
  });

  it("client.ts emits one typed wrapper per operation", () => {
    expect(files["client.ts"]).toMatch(/export function addPet\(body: Pet/);
    expect(files["client.ts"]).toMatch(
      /export function getPetById\(petId: number/,
    );
    expect(files["client.ts"]).toMatch(
      /export function findPetsByStatus\(query: /,
    );
  });

  it("client.ts maps delete to k6's `del`", () => {
    expect(files["client.ts"]).toMatch(/http\.del\(url/);
  });

  it("client.ts tags every request with `operation` for budget filtering", () => {
    expect(files["client.ts"]).toMatch(/__mergeTags\(['"]addPet['"]/);
    expect(files["client.ts"]).toMatch(/__mergeTags\(['"]getPetById['"]/);
  });

  it("client.ts inlines BASE_URL from spec servers", () => {
    expect(files["client.ts"]).toMatch(/BASE_URL.*petstore3\.swagger\.io/);
  });

  it("types.ts has one alias per schema", () => {
    expect(files["types.ts"]).toMatch(/export type Pet = /);
    expect(files["types.ts"]).toMatch(/export type Order = /);
    expect(files["types.ts"]).toMatch(/export type User = /);
  });

  it("data.ts emits typed faker builders for objects and primitives", () => {
    expect(files["data.ts"]).toMatch(
      /Pet: \(overrides\?: Partial<Pet>\): Pet =>/,
    );
    expect(files["data.ts"]).toMatch(
      /StatusEnum: \(overrides\?: StatusEnum\): StatusEnum =>/,
    );
  });
});
