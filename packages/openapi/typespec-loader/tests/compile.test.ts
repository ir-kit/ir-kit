import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { compileTypespec, isTypespecPath } from "../src/index.ts";

const FIXTURE = resolve(__dirname, "fixtures/petstore.tsp");

describe("compileTypespec — from file path", () => {
  it("emits a single OpenAPI 3 document for the Petstore fixture", async () => {
    const result = await compileTypespec({ path: FIXTURE });
    expect(result.documents.length).toBe(1);
    const doc = result.document as unknown as Record<string, unknown>;
    expect((doc.info as { title: string }).title).toBe("Petstore");
    expect(doc.paths).toBeDefined();
    expect((doc.paths as Record<string, unknown>)["/pets"]).toBeDefined();
  });
});

describe("compileTypespec — from inline source", () => {
  it("compiles an in-memory TypeSpec string with imports", async () => {
    const result = await compileTypespec({
      source: `
        using Http;
        @service(#{ title: "Inline" })
        namespace Inline;
        @route("/ping") @get op ping(): { ok: boolean };
      `,
      imports: ["@typespec/http"],
    });
    const doc = result.document as unknown as Record<string, unknown>;
    expect((doc.info as { title: string }).title).toBe("Inline");
    expect((doc.paths as Record<string, unknown>)["/ping"]).toBeDefined();
  });
});

describe("isTypespecPath", () => {
  it("detects .tsp suffix", () => {
    expect(isTypespecPath("main.tsp")).toBe(true);
    expect(isTypespecPath("./api/main.TSP")).toBe(true);
    expect(isTypespecPath("openapi.yaml")).toBe(false);
    expect(isTypespecPath(undefined)).toBe(false);
  });
});
