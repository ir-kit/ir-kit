import type { OpenAPIV3_1 } from "@hey-api/spec-types";
import { describe, expect, it } from "vitest";

import { createRecon } from "../src/index.ts";

function emptyJsonLikeResponse(contentType: string, status = 200): Response {
  // Empty body — mimics a DevTools cache miss where the body wasn't
  // captured but the headers were.
  return new Response(null, {
    status,
    headers: { "content-type": contentType },
  });
}

function textResponse(
  body: string,
  contentType: string,
  status = 200,
): Response {
  return new Response(body, {
    status,
    headers: { "content-type": contentType },
  });
}

function getOp(
  doc: OpenAPIV3_1.Document,
  path: string,
): OpenAPIV3_1.OperationObject {
  return (
    doc.paths as unknown as Record<
      string,
      Record<string, OpenAPIV3_1.OperationObject>
    >
  )[path].get;
}

describe("response capture for non-JSON / cached responses", () => {
  it("records the real status code even when body is empty (e.g. cached responses)", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/cached"),
      emptyJsonLikeResponse("application/json", 200),
    );

    const op = getOp(recon.toOpenAPI(), "/cached");
    expect(Object.keys(op.responses ?? {})).toEqual(["200"]);
    const resp = op.responses?.["200"] as OpenAPIV3_1.ResponseObject;
    expect(resp.content).toBeUndefined();
  });

  it("captures yaml bodies as string examples (no schema)", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/spec"),
      textResponse("openapi: 3.1.0\ninfo:\n  title: t\n", "text/yaml"),
    );

    const op = getOp(recon.toOpenAPI(), "/spec");
    const resp = op.responses?.["200"] as OpenAPIV3_1.ResponseObject;
    const media = resp.content?.["text/yaml"] as OpenAPIV3_1.MediaTypeObject;
    expect(media).toBeDefined();
    expect(media.schema).toBeUndefined();
    expect(media.example).toContain("openapi: 3.1.0");
  });

  it("keeps multiple content-types per status apart", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/multi", {
        headers: { accept: "application/json" },
      }),
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    await recon.observe(
      new Request("https://api.example.com/multi", {
        headers: { accept: "text/yaml" },
      }),
      textResponse("ok: true\n", "text/yaml"),
    );

    const op = getOp(recon.toOpenAPI(), "/multi");
    const resp = op.responses?.["200"] as OpenAPIV3_1.ResponseObject;
    expect(Object.keys(resp.content ?? {}).sort()).toEqual([
      "application/json",
      "text/yaml",
    ]);
  });

  it("records distinct status codes for the same endpoint", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/items"),
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    await recon.observe(
      new Request("https://api.example.com/items"),
      new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );

    const op = getOp(recon.toOpenAPI(), "/items");
    expect(Object.keys(op.responses ?? {}).sort()).toEqual(["200", "404"]);
  });
});
