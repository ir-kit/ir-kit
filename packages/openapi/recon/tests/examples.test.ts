import type { OpenAPIV3_1 } from "@hey-api/spec-types";
import { describe, expect, it } from "vitest";

import { createRecon } from "../src/index.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function jsonRequest(url: string, body: unknown, method = "POST"): Request {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mediaFor(
  doc: OpenAPIV3_1.Document,
  path: string,
  method: "get" | "post",
  status: string,
): OpenAPIV3_1.MediaTypeObject {
  const paths = doc.paths as unknown as Record<
    string,
    Record<string, OpenAPIV3_1.OperationObject>
  >;
  const op = paths[path][method];
  const resp = op.responses?.[status] as OpenAPIV3_1.ResponseObject;
  return resp.content!["application/json"];
}

function requestMediaFor(
  doc: OpenAPIV3_1.Document,
  path: string,
  method: "post",
): OpenAPIV3_1.MediaTypeObject {
  const paths = doc.paths as unknown as Record<
    string,
    Record<string, OpenAPIV3_1.OperationObject>
  >;
  const op = paths[path][method];
  const body = op.requestBody as OpenAPIV3_1.RequestBodyObject;
  return body.content["application/json"];
}

describe("example capture", () => {
  it("emits a single inline example for one observation", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/ping"),
      jsonResponse({ ok: true }),
    );

    const media = mediaFor(recon.toOpenAPI(), "/ping", "get", "200");
    expect(media.example).toEqual({ ok: true });
    expect(media.examples).toBeUndefined();
  });

  it("emits a named examples map for multiple distinct samples", async () => {
    const recon = createRecon({ maxExamples: 3 });
    await recon.observe(
      new Request("https://api.example.com/users/1"),
      jsonResponse({ id: 1, name: "Ada" }),
    );
    await recon.observe(
      new Request("https://api.example.com/users/2"),
      jsonResponse({ id: 2, name: "Linus" }),
    );

    const media = mediaFor(recon.toOpenAPI(), "/users/{userId}", "get", "200");
    expect(media.example).toBeUndefined();
    expect(Object.keys(media.examples ?? {})).toHaveLength(2);
    expect(
      (media.examples?.["example-1"] as OpenAPIV3_1.ExampleObject).value,
    ).toEqual({ id: 1, name: "Ada" });
  });

  it("dedups identical payloads", async () => {
    const recon = createRecon();
    await recon.observe(
      new Request("https://api.example.com/ping"),
      jsonResponse({ ok: true }),
    );
    await recon.observe(
      new Request("https://api.example.com/ping"),
      jsonResponse({ ok: true }),
    );

    const media = mediaFor(recon.toOpenAPI(), "/ping", "get", "200");
    expect(media.example).toEqual({ ok: true });
    expect(media.examples).toBeUndefined();
  });

  it("caps at maxExamples per status code after merge", async () => {
    const recon = createRecon({ maxExamples: 2 });
    for (let i = 1; i <= 5; i++) {
      await recon.observe(
        new Request(`https://api.example.com/users/${i}`),
        jsonResponse({ id: i, name: `user-${i}` }),
      );
    }

    const media = mediaFor(recon.toOpenAPI(), "/users/{userId}", "get", "200");
    expect(Object.keys(media.examples ?? {})).toHaveLength(2);
  });

  it("captures request body examples too", async () => {
    const recon = createRecon();
    await recon.observe(
      jsonRequest("https://api.example.com/users", {
        name: "Ada",
        role: "admin",
      }),
      jsonResponse({ id: 1, name: "Ada", role: "admin" }, 201),
    );

    const media = requestMediaFor(recon.toOpenAPI(), "/users", "post");
    expect(media.example).toEqual({ name: "Ada", role: "admin" });
  });

  it("disables capture when maxExamples = 0", async () => {
    const recon = createRecon({ maxExamples: 0 });
    await recon.observe(
      new Request("https://api.example.com/ping"),
      jsonResponse({ ok: true }),
    );

    const media = mediaFor(recon.toOpenAPI(), "/ping", "get", "200");
    expect(media.example).toBeUndefined();
    expect(media.examples).toBeUndefined();
  });
});
