import type { OpenAPIV3_1 } from "@hey-api/spec-types";
import { describe, expect, it } from "vitest";

import { createRecon } from "../src/index.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("dedupe does not corrupt examples", () => {
  it("leaves example payloads alone even when they contain `schema` keys", async () => {
    // Mimic Nagra's `__attachments/openapi/<id>` endpoint: the response
    // body itself is an OpenAPI document, so it contains nested `schema`
    // keys that look like real schemas to a naive walker.
    const apiDoc = {
      openapi: "3.0.3",
      paths: {
        "/foo": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { id: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
        "/bar": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { id: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const recon = createRecon({ refDedupeThreshold: 2 });
    await recon.observe(
      new Request("https://api.example.com/spec.json"),
      jsonResponse(apiDoc),
    );

    const doc = recon.toOpenAPI();
    const op = (
      doc.paths as unknown as Record<
        string,
        Record<string, OpenAPIV3_1.OperationObject>
      >
    )["/spec.json"]?.get;
    const media = (op?.responses?.["200"] as OpenAPIV3_1.ResponseObject)
      .content?.["application/json"] as OpenAPIV3_1.MediaTypeObject;

    expect(media).toBeDefined();
    // The captured example must round-trip intact — no $refs injected into
    // the example's nested `schema` keys.
    expect(media.example).toEqual(apiDoc);
    const serialized = JSON.stringify(media.example);
    expect(serialized).not.toContain("#/components/schemas/");
  });
});
