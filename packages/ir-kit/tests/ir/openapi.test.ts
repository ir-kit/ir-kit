import { describe, expect, it } from "vitest";

import { parseOpenAPI } from "../../src/ir/index.js";

const doc = (extra: Record<string, unknown>) => ({
  openapi: "3.1.0",
  info: { title: "t", version: "0" },
  components: {
    securitySchemes: {
      bearer: { type: "http", scheme: "bearer" },
      key: { type: "apiKey", in: "header", name: "X-Key" },
    },
  },
  ...extra,
});

describe("parseOpenAPI", () => {
  it("reads security scheme names from the operation, then the document", () => {
    const model = parseOpenAPI(
      doc({
        security: [{ bearer: [] }],
        paths: {
          "/a": { get: { responses: { 200: { description: "ok" } } } },
          "/b": {
            get: {
              security: [{ key: [] }, { bearer: [], key: [] }],
              responses: { 200: { description: "ok" } },
            },
          },
          "/c": {
            get: { security: [], responses: { 200: { description: "ok" } } },
          },
        },
      }),
    );
    expect(model.paths?.["/a"]?.get?.securitySchemes).toEqual(["bearer"]);
    expect(model.paths?.["/b"]?.get?.securitySchemes).toEqual([
      "key",
      "bearer",
    ]);
    expect(model.paths?.["/c"]?.get?.securitySchemes).toEqual([]);
  });

  it("follows path item $refs", () => {
    const model = parseOpenAPI(
      doc({
        paths: {
          "/a": {
            $ref: "#/components/pathItems/A",
            post: {
              security: [{ key: [] }],
              responses: { 200: { description: "ok" } },
            },
          },
        },
        components: {
          securitySchemes: { key: { type: "apiKey", in: "header", name: "K" } },
          pathItems: {
            A: {
              get: {
                security: [{ key: [] }],
                responses: { 200: { description: "ok" } },
              },
            },
          },
        },
      }),
    );
    expect(model.paths?.["/a"]?.get?.securitySchemes).toEqual(["key"]);
    expect(model.paths?.["/a"]?.post?.securitySchemes).toEqual(["key"]);
  });

  it("reads Swagger 2.0 documents", () => {
    const model = parseOpenAPI({
      swagger: "2.0",
      info: { title: "t", version: "0" },
      securityDefinitions: { key: { type: "apiKey", in: "header", name: "K" } },
      security: [{ key: [] }],
      paths: { "/a": { get: { responses: { 200: { description: "ok" } } } } },
    });
    expect(model.paths?.["/a"]?.get?.securitySchemes).toEqual(["key"]);
  });
});
