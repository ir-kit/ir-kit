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

describe("@ir-kit/k6-gen", () => {
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
      /import \{[^}]*applyMiddlewareHeaders[^}]*\} from "@ir-kit\/k6\/runtime"/s,
    );
  });

  it("client.ts pulls buildQuery/parseJson/mergeTags from runtime — no inline helpers", () => {
    expect(files["client.ts"]).toMatch(
      /import \{[^}]*\bbuildQuery\b[^}]*\bmergeTags\b[^}]*\bparseJson\b[^}]*\} from "@ir-kit\/k6\/runtime"/s,
    );
    expect(files["client.ts"]).not.toMatch(/function __buildQuery/);
    expect(files["client.ts"]).not.toMatch(/function __parseJson/);
    expect(files["client.ts"]).not.toMatch(/function __mergeTags/);
  });

  it("client.ts emits one typed wrapper per operation", () => {
    expect(files["client.ts"]).toMatch(/export function addPet\(body: T\.Pet/);
    expect(files["client.ts"]).toMatch(
      /export function getPetById\(petId: number/,
    );
    expect(files["client.ts"]).toMatch(
      /export function findPetsByStatus\(query: /,
    );
  });

  it("client.ts namespace-imports types as `T`", () => {
    expect(files["client.ts"]).toMatch(
      /^import type \* as T from "\.\/types\.js";$/m,
    );
  });

  it("client.ts routes every method through the centralized call() helper", () => {
    // Per-op wrappers funnel through `call<T>(method, url, opId, body, opts)`;
    // method strings are upper-cased verbs (no `http.del` shorthand). The
    // helper itself calls `http.request(spec.method, ...)` once.
    expect(files["client.ts"]).toMatch(
      /export function deletePet[\s\S]*call<[^>]*>\("DELETE"/,
    );
    expect(files["client.ts"]).toMatch(/http\.request\(spec\.method/);
  });

  it("client.ts threads operationId into the centralized call() helper", () => {
    // mergeTags is invoked once inside buildSpec(); per-op call sites pass the
    // opId as a string literal that buildSpec forwards to mergeTags.
    expect(files["client.ts"]).toMatch(/mergeTags\(opId, opts\?\.tags\)/);
    expect(files["client.ts"]).toMatch(
      /export function addPet[\s\S]*call<[^>]*>\("POST",[\s\S]*"addPet"/,
    );
    expect(files["client.ts"]).toMatch(
      /export function getPetById[\s\S]*call<[^>]*>\("GET",[\s\S]*"getPetById"/,
    );
  });

  it("client.ts inlines DEFAULT_BASE_URL from spec servers", () => {
    expect(files["client.ts"]).toMatch(
      /DEFAULT_BASE_URL.*petstore3\.swagger\.io/,
    );
  });

  it("client.ts calls getBaseUrl(DEFAULT_BASE_URL) — enables defineLoadTest({ baseUrl })", () => {
    expect(files["client.ts"]).toMatch(/getBaseUrl\(DEFAULT_BASE_URL\)/);
    expect(files["client.ts"]).toMatch(
      /import \{[^}]*\bgetBaseUrl\b[^}]*\} from "@ir-kit\/k6\/runtime"/s,
    );
  });

  it("types.ts has one alias per schema", () => {
    expect(files["types.ts"]).toMatch(/export type Pet = /);
    expect(files["types.ts"]).toMatch(/export type Order = /);
    expect(files["types.ts"]).toMatch(/export type User = /);
  });

  it("data.ts emits typed faker builders for objects and primitives", () => {
    expect(files["data.ts"]).toMatch(
      /Pet: \(overrides\?: Partial<T\.Pet>\): T\.Pet =>/,
    );
    expect(files["data.ts"]).toMatch(
      /StatusEnum: \(overrides\?: T\.StatusEnum\): T\.StatusEnum =>/,
    );
  });

  it("emits literal unions for enums (not collapsed `string | string`)", () => {
    expect(files["types.ts"]).toMatch(
      /export type StatusEnum =\s*'placed' \| 'approved' \| 'delivered';/,
    );
    expect(files["types.ts"]).not.toMatch(/string \| string/);
  });
});

describe("@ir-kit/k6-gen — identifier sanitization", () => {
  it("sanitizes schema names that start with a digit", async () => {
    const { generate } = await import("../src/index.ts");
    const spec = {
      openapi: "3.0.0",
      info: { title: "t", version: "1" },
      paths: {},
      components: {
        schemas: {
          "0Enum": { type: "string", enum: ["a", "b"] },
        },
      },
    };
    const { files } = await generate({
      input: spec,
      output: "/tmp/_k6_unused",
      dryRun: true,
    });
    const types = files.find((f) => f.path === "types.ts")!.content;
    expect(types).toMatch(/export type _0Enum =\s*'a' \| 'b';/);
    expect(types).not.toMatch(/export type 0Enum/);
  });
});

describe("@ir-kit/k6-gen — empty schemas", () => {
  async function generateEmpty() {
    const { generate } = await import("../src/index.ts");
    return generate({
      input: {
        openapi: "3.0.0",
        info: { title: "t", version: "1" },
        paths: {},
      },
      output: "/tmp/_k6_unused",
      dryRun: true,
    });
  }

  it("data.ts has no dead faker import when there are no schemas", async () => {
    const { files } = await generateEmpty();
    const data = files.find((f) => f.path === "data.ts")!.content;
    expect(data).toContain("export const data = {} as const;");
    expect(data).not.toContain("@faker-js/faker");
    expect(data).not.toMatch(/import type \* as T/);
  });

  it("types.ts emits `export {};` so the file is a valid module", async () => {
    const { files } = await generateEmpty();
    const types = files.find((f) => f.path === "types.ts")!.content;
    expect(types).toMatch(/export \{\};/);
  });
});
