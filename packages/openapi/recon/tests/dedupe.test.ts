import type { OpenAPIV3_1 } from "@hey-api/spec-types";
import { describe, expect, it } from "vitest";

import { createRecon } from "../src/index.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function schemaFor(
  doc: OpenAPIV3_1.Document,
  path: string,
  method: "get" | "post",
  status: string,
): unknown {
  const paths = doc.paths as unknown as Record<
    string,
    Record<string, OpenAPIV3_1.OperationObject>
  >;
  const op = paths[path][method];
  const resp = op.responses?.[status] as OpenAPIV3_1.ResponseObject;
  return resp.content!["application/json"].schema;
}

describe("structural-hash $ref dedupe", () => {
  it("hoists a repeated object shape to components.schemas", async () => {
    const recon = createRecon({ refDedupeThreshold: 2, maxExamples: 0 });
    await recon.observe(
      new Request("https://api.example.com/me"),
      jsonResponse({ id: 1, name: "Ada", email: "ada@x.com" }),
    );
    await recon.observe(
      new Request("https://api.example.com/profile"),
      jsonResponse({ id: 1, name: "Ada", email: "ada@x.com" }),
    );

    const doc = recon.toOpenAPI();
    const schemas = doc.components?.schemas ?? {};
    const names = Object.keys(schemas);
    expect(names.length).toBe(1);

    expect(schemaFor(doc, "/me", "get", "200")).toEqual({
      $ref: `#/components/schemas/${names[0]}`,
    });
    expect(schemaFor(doc, "/profile", "get", "200")).toEqual({
      $ref: `#/components/schemas/${names[0]}`,
    });
  });

  it("hoists nested shapes too (e.g. a wrapping `data` envelope around a shared object)", async () => {
    const recon = createRecon({ refDedupeThreshold: 2, maxExamples: 0 });
    await recon.observe(
      new Request("https://api.example.com/me"),
      jsonResponse({
        data: { id: 1, name: "Ada", email: "ada@x.com" },
        meta: { ts: 1 },
      }),
    );
    await recon.observe(
      new Request("https://api.example.com/profile"),
      jsonResponse({
        data: { id: 2, name: "Linus", email: "linus@x.com" },
        meta: { ts: 2 },
      }),
    );

    const doc = recon.toOpenAPI();
    const schemas = doc.components?.schemas ?? {};
    // The inner `{id, name, email}` shape is shared even though it appears
    // wrapped — dedupe walks into properties to find it.
    expect(Object.keys(schemas).length).toBeGreaterThan(0);
    expect(JSON.stringify(doc)).toContain("#/components/schemas/");
  });

  it("does not hoist when threshold is not met", async () => {
    const recon = createRecon({ refDedupeThreshold: 2, maxExamples: 0 });
    await recon.observe(
      new Request("https://api.example.com/users/1"),
      jsonResponse({ id: 1, name: "Ada" }),
    );

    expect(recon.toOpenAPI().components?.schemas).toBeUndefined();
  });

  it("respects refDedupeThreshold = 0 (disabled)", async () => {
    const recon = createRecon({ refDedupeThreshold: 0, maxExamples: 0 });
    await recon.observe(
      new Request("https://api.example.com/users/1"),
      jsonResponse({ id: 1, name: "Ada" }),
    );
    await recon.observe(
      new Request("https://api.example.com/admins/1"),
      jsonResponse({ id: 1, name: "Ada" }),
    );
    expect(recon.toOpenAPI().components?.schemas).toBeUndefined();
  });
});
