import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  detachExtensionRefs,
  loadOpenAPI,
  resolveOpenAPIInput,
} from "../src/index.ts";

describe("resolveOpenAPIInput", () => {
  it("passes https URLs through verbatim", () => {
    expect(
      resolveOpenAPIInput("https://api.example.com/openapi.yaml", "/proj"),
    ).toBe("https://api.example.com/openapi.yaml");
  });

  it("passes http URLs through verbatim", () => {
    expect(
      resolveOpenAPIInput("http://localhost:8080/spec.json", "/proj"),
    ).toBe("http://localhost:8080/spec.json");
  });

  it("passes absolute paths through verbatim", () => {
    expect(resolveOpenAPIInput("/abs/path/spec.yaml", "/proj")).toBe(
      "/abs/path/spec.yaml",
    );
  });

  it("resolves relative paths against cwd", () => {
    expect(resolveOpenAPIInput("./openapi.yaml", "/proj")).toBe(
      "/proj/openapi.yaml",
    );
  });

  it("trims whitespace before deciding", () => {
    expect(
      resolveOpenAPIInput("   https://api.example.com/spec.yaml   ", "/proj"),
    ).toBe("https://api.example.com/spec.yaml");
  });

  it("returns pre-parsed objects unchanged", () => {
    const spec = { openapi: "3.1.0", info: { title: "t", version: "1" } };
    expect(resolveOpenAPIInput(spec, "/proj")).toBe(spec);
  });

  it("throws on empty input instead of resolving to cwd", () => {
    expect(() => resolveOpenAPIInput("", "/proj")).toThrow(
      /empty or only whitespace/,
    );
    expect(() => resolveOpenAPIInput("   ", "/proj")).toThrow(
      /empty or only whitespace/,
    );
  });
});

describe("extension refs", () => {
  it("does not fetch external refs inside x- extensions", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ir-kit-loader-"));
    writeFileSync(
      join(dir, "pet.yaml"),
      "type: object\nproperties:\n  name:\n    type: string\n",
    );
    writeFileSync(
      join(dir, "openapi.yaml"),
      [
        "openapi: 3.0.3",
        "info: { title: t, version: '1' }",
        "paths: {}",
        "x-policy:",
        "  $ref: ../missing/policies.yaml",
        "components:",
        "  schemas:",
        "    Pet:",
        "      $ref: ./pet.yaml",
      ].join("\n"),
    );
    const spec = await loadOpenAPI({ input: join(dir, "openapi.yaml") });
    expect(spec["x-policy"]).toEqual({ "x-$ref": "../missing/policies.yaml" });
    const schemas = (spec.components as { schemas: Record<string, unknown> })
      .schemas;
    const ref = (schemas.Pet as { $ref: string }).$ref;
    const pet = schemas[ref.split("/").pop() ?? ""] as {
      properties: Record<string, unknown>;
    };
    expect(pet.properties.name).toEqual({ type: "string" });
  });

  it("treats x- named schemas and properties as schemas", () => {
    const spec = {
      components: {
        schemas: {
          "x-thing": { $ref: "./thing.yaml" },
          Owner: { properties: { "x-id": { $ref: "./id.yaml" } } },
        },
      },
    };
    detachExtensionRefs(spec);
    expect(spec.components.schemas["x-thing"]).toEqual({
      $ref: "./thing.yaml",
    });
    expect(spec.components.schemas.Owner.properties["x-id"]).toEqual({
      $ref: "./id.yaml",
    });
  });
});
