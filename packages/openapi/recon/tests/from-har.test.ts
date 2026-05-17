import type { OpenAPIV3_1 } from "@hey-api/spec-types";
import { describe, expect, it } from "vitest";

import { fromHAR, type HarFile } from "../src/index.ts";

/** Build a HAR file with one entry from a few primitives. */
function harWith(
  entries: ReadonlyArray<{
    method: string;
    url: string;
    requestBody?: string;
    requestContentType?: string;
    requestHeaders?: ReadonlyArray<{ name: string; value: string }>;
    status?: number;
    responseBody?: string;
    responseContentType?: string;
  }>,
): HarFile {
  return {
    log: {
      entries: entries.map((e) => ({
        request: {
          method: e.method,
          url: e.url,
          headers: [
            ...(e.requestContentType
              ? [{ name: "Content-Type", value: e.requestContentType }]
              : []),
            ...(e.requestHeaders ?? []),
          ],
          postData: e.requestBody
            ? { text: e.requestBody, mimeType: e.requestContentType }
            : undefined,
        },
        response: {
          status: e.status ?? 200,
          headers: e.responseContentType
            ? [{ name: "Content-Type", value: e.responseContentType }]
            : [],
          content: {
            text: e.responseBody,
            mimeType: e.responseContentType,
          },
        },
      })),
    },
  };
}

function pathsOf(doc: OpenAPIV3_1.Document): string[] {
  return Object.keys(doc.paths ?? {});
}

describe("fromHAR", () => {
  it("folds a single GET entry into a spec", async () => {
    // Path templating requires multiple samples — one entry keeps the literal path.
    const har = harWith([
      {
        method: "GET",
        url: "https://api.example.com/pets/1",
        status: 200,
        responseContentType: "application/json",
        responseBody: JSON.stringify({ id: 1, name: "rex" }),
      },
    ]);

    const recon = await fromHAR(har);
    expect(recon.sampleCount()).toBe(1);
    expect(pathsOf(recon.toOpenAPI())).toEqual(["/pets/1"]);
  });

  it("accepts JSON content as a string", async () => {
    const har = harWith([
      {
        method: "GET",
        url: "https://api.example.com/health",
        status: 200,
      },
    ]);

    const recon = await fromHAR(JSON.stringify(har));
    expect(recon.sampleCount()).toBe(1);
    expect(pathsOf(recon.toOpenAPI())).toEqual(["/health"]);
  });

  it("templates paths across multiple entries with shaped IDs", async () => {
    const har = harWith([
      {
        method: "GET",
        url: "https://api.example.com/pets/1",
        responseContentType: "application/json",
        responseBody: '{"id":1}',
      },
      {
        method: "GET",
        url: "https://api.example.com/pets/42",
        responseContentType: "application/json",
        responseBody: '{"id":42}',
      },
      {
        method: "GET",
        url: "https://api.example.com/pets/9999",
        responseContentType: "application/json",
        responseBody: '{"id":9999}',
      },
    ]);

    const recon = await fromHAR(har);
    const paths = pathsOf(recon.toOpenAPI());
    expect(paths).toHaveLength(1);
    expect(paths[0]).toMatch(/^\/pets\/\{[a-zA-Z]+Id\}$/);
  });

  it("forwards POST bodies into the inferred request schema", async () => {
    const har = harWith([
      {
        method: "POST",
        url: "https://api.example.com/pets",
        requestContentType: "application/json",
        requestBody: JSON.stringify({ name: "rex", tag: "dog" }),
        status: 201,
        responseContentType: "application/json",
        responseBody: JSON.stringify({ id: 1, name: "rex", tag: "dog" }),
      },
    ]);

    const recon = await fromHAR(har);
    const spec = recon.toOpenAPI();
    const op = (
      spec.paths!["/pets"] as Record<string, OpenAPIV3_1.OperationObject>
    ).post;
    expect(op).toBeDefined();
    const reqSchema = (op.requestBody as OpenAPIV3_1.RequestBodyObject)
      ?.content?.["application/json"]?.schema as {
      properties?: Record<string, unknown>;
    };
    expect(reqSchema?.properties).toMatchObject({
      name: expect.anything(),
      tag: expect.anything(),
    });
  });

  it("drops HTTP/2 pseudo-headers without failing the entry", async () => {
    // Chrome DevTools HARs include `:authority`, `:method`, `:path`, `:scheme` —
    // Fetch's Headers API rejects them. We skip silently.
    const har = harWith([
      {
        method: "GET",
        url: "https://api.example.com/items",
        requestHeaders: [
          { name: ":authority", value: "api.example.com" },
          { name: ":method", value: "GET" },
          { name: ":path", value: "/items" },
          { name: ":scheme", value: "https" },
          { name: "Accept", value: "application/json" },
        ],
        status: 200,
        responseContentType: "application/json",
        responseBody: "[]",
      },
    ]);

    const recon = await fromHAR(har);
    expect(recon.sampleCount()).toBe(1);
  });

  it("drops bodies on GET/HEAD (Fetch rejects them)", async () => {
    // DevTools HARs sometimes carry an empty postData on GETs. Don't crash.
    const har: HarFile = {
      log: {
        entries: [
          {
            request: {
              method: "GET",
              url: "https://api.example.com/items",
              headers: [],
              postData: { text: "" },
            },
            response: {
              status: 200,
              headers: [{ name: "Content-Type", value: "application/json" }],
              content: { text: "[]" },
            },
          },
        ],
      },
    };
    const recon = await fromHAR(har);
    expect(recon.sampleCount()).toBe(1);
  });

  it("skips entries with malformed URLs without failing the whole replay", async () => {
    const har: HarFile = {
      log: {
        entries: [
          {
            request: {
              method: "GET",
              url: "ht!tp://malformed",
              headers: [],
            },
            response: {
              status: 200,
              headers: [],
              content: { text: "" },
            },
          },
          {
            request: {
              method: "GET",
              url: "https://api.example.com/ok",
              headers: [],
            },
            response: {
              status: 200,
              headers: [],
              content: { text: "" },
            },
          },
        ],
      },
    };
    const recon = await fromHAR(har);
    expect(recon.sampleCount()).toBe(1);
    expect(pathsOf(recon.toOpenAPI())).toEqual(["/ok"]);
  });

  it("passes ReconConfig (title/version/etc) through to createRecon", async () => {
    const har = harWith([
      { method: "GET", url: "https://api.example.com/x", status: 200 },
    ]);
    const recon = await fromHAR(har, { title: "My API", version: "9.9.9" });
    const spec = recon.toOpenAPI();
    expect(spec.info.title).toBe("My API");
    expect(spec.info.version).toBe("9.9.9");
  });

  it("returns an empty Recon when the HAR has no entries", async () => {
    const har: HarFile = { log: { entries: [] } };
    const recon = await fromHAR(har);
    expect(recon.sampleCount()).toBe(0);
  });
});
