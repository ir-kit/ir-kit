import protobuf from "protobufjs";
import { describe, expect, it } from "vitest";

import { openAPIToProto } from "../src/converters/openapi3-to-proto/index.js";

const spec = (
  extra: Record<string, unknown>,
  schemas: Record<string, unknown> = {},
) => ({
  openapi: "3.0.3",
  info: { title: "Pet Store", version: "1.0.0" },
  paths: {},
  components: { schemas },
  ...extra,
});

function convert(doc: Record<string, unknown>) {
  const source = openAPIToProto(doc);
  const root = protobuf.parse(source, { keepCase: true }).root;
  return { source, root };
}

describe("openAPIToProto", () => {
  it("maps component schemas to messages and enums", () => {
    const { source, root } = convert(
      spec(
        {},
        {
          Pet: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "integer", format: "int64" },
              name: { type: "string" },
              tag: { type: "string" },
              status: { $ref: "#/components/schemas/PetStatus" },
              photoUrls: { type: "array", items: { type: "string" } },
              labels: {
                type: "object",
                additionalProperties: { type: "integer", format: "int32" },
              },
              owner: {
                type: "object",
                properties: { email: { type: "string" } },
              },
              born: { type: "string", format: "date-time" },
              tags: { $ref: "#/components/schemas/Tags" },
            },
          },
          PetStatus: { type: "string", enum: ["available", "sold-out"] },
          Tags: { type: "array", items: { type: "string" } },
        },
      ),
    );
    expect(source).toContain("package pet_store;");
    expect(source).toContain(`message Pet {
  int64 id = 1;
  string name = 2;
  optional string tag = 3;
  optional PetStatus status = 4;
  repeated string photo_urls = 5;
  map<string, int32> labels = 6;
  PetOwner owner = 7;
  google.protobuf.Timestamp born = 8;
  repeated string tags = 9;
}`);
    expect(source).toContain(`enum PetStatus {
  PET_STATUS_UNSPECIFIED = 0;
  PET_STATUS_AVAILABLE = 1;
  PET_STATUS_SOLD_OUT = 2;
}`);
    expect(source).toContain('import "google/protobuf/timestamp.proto";');
    expect(source).not.toContain("message Tags");
    expect(root.lookupType("pet_store.PetOwner").fields.email).toBeDefined();
  });

  it("merges allOf members into one message", () => {
    const { root } = convert(
      spec(
        {},
        {
          Pet: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" } },
          },
          Dog: {
            allOf: [
              { $ref: "#/components/schemas/Pet" },
              { type: "object", properties: { barks: { type: "boolean" } } },
            ],
          },
        },
      ),
    );
    const dog = root.lookupType("pet_store.Dog");
    expect(Object.keys(dog.fields)).toEqual(["name", "barks"]);
    expect(dog.fields.barks?.options?.proto3_optional).toBe(true);
  });

  it("maps unions to a oneof", () => {
    const { source } = convert(
      spec(
        {},
        {
          Cat: { type: "object", properties: { purrs: { type: "boolean" } } },
          Dog: { type: "object", properties: { barks: { type: "boolean" } } },
          Pet: {
            oneOf: [
              { $ref: "#/components/schemas/Cat" },
              { $ref: "#/components/schemas/Dog" },
              { type: "string" },
            ],
          },
        },
      ),
    );
    expect(source).toContain(`message Pet {
  oneof variant {
    Cat cat = 1;
    Dog dog = 2;
    string string_value = 3;
  }
}`);
  });

  it("boxes nested repeated and map types", () => {
    const { source } = convert(
      spec(
        {},
        {
          Grid: {
            type: "object",
            properties: {
              rows: {
                type: "array",
                items: { type: "array", items: { type: "number" } },
              },
            },
          },
        },
      ),
    );
    expect(source).toContain("repeated GridRowsItem rows = 1;");
    expect(source).toContain(`message GridRowsItem {
  repeated double items = 1;
}`);
  });

  it("keeps names unique and valid", () => {
    const { source } = convert(
      spec(
        {},
        {
          Mode: { type: "string", enum: ["", "a-b", "a_b", "GMT0", "GMT_0"] },
          Item: {
            type: "object",
            properties: {
              petId: { type: "string" },
              pet_id: { type: "string" },
              "2fa": { type: "boolean" },
            },
          },
        },
      ),
    );
    expect(source).toContain(`enum Mode {
  MODE_UNSPECIFIED = 0;
  MODE_EMPTY = 1;
  MODE_A_B = 2;
  MODE_A_B_2 = 3;
  MODE_GMT0 = 4;
  MODE_GMT_0_2 = 5;
}`);
    expect(source).toContain(`message Item {
  optional string pet_id = 1;
  optional string pet_id_2 = 2 [json_name = "pet_id"];
  optional bool f_2fa = 3 [json_name = "2fa"];
}`);
  });

  it("maps operations to services and RPCs", () => {
    const { source, root } = convert(
      spec(
        {
          paths: {
            "/pets/{petId}": {
              get: {
                operationId: "getPet",
                tags: ["pets"],
                summary: "Find a pet",
                parameters: [
                  {
                    name: "petId",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                  },
                  {
                    name: "X-Trace",
                    in: "header",
                    schema: { type: "string" },
                  },
                ],
                responses: {
                  "200": {
                    description: "ok",
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/Pet" },
                      },
                    },
                  },
                },
              },
              put: {
                tags: ["pets"],
                deprecated: true,
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: { $ref: "#/components/schemas/Pet" },
                    },
                  },
                },
                responses: {
                  "200": {
                    description: "ok",
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/Pet" },
                      },
                    },
                  },
                  "202": {
                    description: "queued",
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: { jobId: { type: "string" } },
                        },
                      },
                    },
                  },
                },
              },
            },
            "/health": {
              get: {
                operationId: "health",
                responses: { "204": { description: "ok" } },
              },
            },
          },
        },
        {
          Pet: { type: "object", properties: { name: { type: "string" } } },
        },
      ),
    );
    expect(source).toContain(`service PetsService {
  // Find a pet
  //
  // GET /pets/{petId}
  rpc GetPet(GetPetRequest) returns (Pet);`);
    expect(source).toContain(
      "rpc Health(google.protobuf.Empty) returns (google.protobuf.Empty);",
    );
    expect(source).toContain("option deprecated = true;");
    expect(source).toContain(`message GetPetRequest {
  int64 pet_id = 1;
  optional string x_trace = 2 [json_name = "X-Trace"];
}`);
    const put = root.lookupService("pet_store.PetsService").methods
      .PutPetsPetId;
    expect(put?.requestType).toBe("PutPetsPetIdRequest");
    expect(put?.responseType).toBe("PutPetsPetIdResponse");
    expect(source).toContain(`message PutPetsPetIdResponse {
  oneof variant {
    // ok
    Pet status_200 = 1;
    // queued
    PutPetsPetIdResponseStatus202 status_202 = 2;
  }
}`);
    expect(
      root.lookupType("pet_store.PutPetsPetIdRequest").fields.body?.type,
    ).toBe("Pet");
  });

  it("rejects an invalid package name", () => {
    expect(() => openAPIToProto(spec({}), { package: "1bad" })).toThrow(
      "invalid package name",
    );
  });
});

describe("openAPIToProto allOf", () => {
  it("keeps nested fields every member declares for the same property", () => {
    const { root } = convert(
      spec(
        {},
        {
          Base: {
            type: "object",
            properties: {
              address: {
                type: "object",
                properties: { street: { type: "string" } },
              },
            },
          },
          Extended: {
            allOf: [
              { $ref: "#/components/schemas/Base" },
              {
                type: "object",
                properties: {
                  address: {
                    type: "object",
                    properties: { city: { type: "string" } },
                  },
                },
              },
            ],
          },
        },
      ),
    );
    expect(
      Object.keys(root.lookupType("pet_store.ExtendedAddress").fields),
    ).toEqual(["street", "city"]);
  });
});
