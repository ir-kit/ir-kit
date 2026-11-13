import { describe, expect, it } from "vitest";

import { hoistForeignSchemaRefs } from "../../src/openapi/index.ts";

describe("hoistForeignSchemaRefs", () => {
  it("moves schemas referenced from inside paths into components", () => {
    const cors = { type: "object", properties: { origin: { type: "string" } } };
    const spec = {
      openapi: "3.1.0",
      paths: {
        "/apps": {
          get: {
            responses: {
              200: {
                content: {
                  "application/json": {
                    schema: { type: "object", properties: { cors } },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          cors: { type: "string" },
          App: {
            type: "object",
            properties: {
              cors: {
                $ref: "#/paths/~1apps/get/responses/200/content/application~1json/schema/properties/cors",
              },
            },
          },
        },
      },
    };
    const added = hoistForeignSchemaRefs(spec);
    expect([...added]).toEqual(["cors2"]);
    expect(spec.components.schemas.App.properties.cors.$ref).toBe(
      "#/components/schemas/cors2",
    );
    expect(spec.components.schemas).toHaveProperty("cors2", cors);
  });

  it("leaves component and non-schema refs alone", () => {
    const spec = {
      openapi: "3.0.0",
      paths: {},
      components: {
        schemas: { A: { $ref: "#/components/schemas/B" }, B: {} },
        parameters: { p: { $ref: "#/components/parameters/q" } },
      },
    };
    expect(hoistForeignSchemaRefs(spec).size).toBe(0);
    expect(spec.components.schemas.A.$ref).toBe("#/components/schemas/B");
  });
});
