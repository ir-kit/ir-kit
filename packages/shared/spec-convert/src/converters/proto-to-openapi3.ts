import { readFile } from "node:fs/promises";

import protobuf from "protobufjs";

import { registerConverter } from "../registry.js";
import type { ConvertOutput, SpecDocument } from "../types.js";

type OpenAPISchema = Record<string, unknown>;

registerConverter({
  from: "proto",
  to: "openapi3",
  handler: async (document: SpecDocument): Promise<ConvertOutput> => {
    const path =
      typeof document.__path === "string" ? document.__path : undefined;
    const source =
      typeof document.__source === "string" ? document.__source : undefined;
    if (!path && !source) {
      throw new Error(
        "proto→openapi3 requires a `__path` or `__source` marker on the input document",
      );
    }

    const text = source ?? (await readFile(path!, "utf8"));
    const root = new protobuf.Root();
    const parsed = protobuf.parse(text, root, { keepCase: true });
    const pkg = parsed.package ?? "default";

    const schemas: Record<string, OpenAPISchema> = {};
    const paths: Record<string, Record<string, unknown>> = {};

    walkNamespace(root, schemas, paths);

    return {
      kind: "document",
      document: {
        openapi: "3.1.0",
        info: { title: pkg, version: "0.0.0" },
        paths,
        components: { schemas },
      },
    };
  },
});

function walkNamespace(
  ns: protobuf.NamespaceBase,
  schemas: Record<string, OpenAPISchema>,
  paths: Record<string, Record<string, unknown>>,
): void {
  if (!ns.nested) return;
  for (const child of Object.values(ns.nested)) {
    if (child instanceof protobuf.Type) {
      schemas[child.fullName.replace(/^\./, "")] = messageToSchema(child);
      walkNamespace(child, schemas, paths);
    } else if (child instanceof protobuf.Enum) {
      schemas[child.fullName.replace(/^\./, "")] = enumToSchema(child);
    } else if (child instanceof protobuf.Service) {
      addServicePaths(child, paths);
    } else if (child instanceof protobuf.Namespace) {
      walkNamespace(child, schemas, paths);
    }
  }
}

function messageToSchema(type: protobuf.Type): OpenAPISchema {
  const properties: Record<string, OpenAPISchema> = {};
  const required: string[] = [];
  for (const field of type.fieldsArray) {
    properties[field.name] = fieldToSchema(field);
    if (field.required) required.push(field.name);
  }
  const schema: OpenAPISchema = {
    type: "object",
    properties,
  };
  if (required.length > 0) schema.required = required;
  if (type.comment) schema.description = type.comment;
  return schema;
}

function enumToSchema(enm: protobuf.Enum): OpenAPISchema {
  const values = Object.keys(enm.values);
  return {
    type: "string",
    enum: values,
    ...(enm.comment ? { description: enm.comment } : {}),
  };
}

function fieldToSchema(field: protobuf.Field): OpenAPISchema {
  const base = primitiveOrRef(field);
  const schema: OpenAPISchema = field.repeated
    ? { type: "array", items: base }
    : base;
  if (field.comment) schema.description = field.comment;
  return schema;
}

function primitiveOrRef(field: protobuf.Field): OpenAPISchema {
  switch (field.type) {
    case "double":
    case "float":
      return { type: "number", format: field.type };
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
      return { type: "integer", format: "int32" };
    case "int64":
    case "uint64":
    case "sint64":
    case "fixed64":
    case "sfixed64":
      return { type: "string", format: "int64" };
    case "bool":
      return { type: "boolean" };
    case "string":
      return { type: "string" };
    case "bytes":
      return { type: "string", format: "byte" };
    default: {
      const ref = field.resolvedType?.fullName ?? field.type;
      return { $ref: `#/components/schemas/${ref.replace(/^\./, "")}` };
    }
  }
}

function addServicePaths(
  svc: protobuf.Service,
  paths: Record<string, Record<string, unknown>>,
): void {
  const serviceName = svc.fullName.replace(/^\./, "");
  for (const method of svc.methodsArray) {
    const url = `/${serviceName.replace(/\./g, "/")}/${method.name}`;
    paths[url] = {
      post: {
        operationId: `${serviceName}_${method.name}`,
        ...(method.comment ? { description: method.comment } : {}),
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${method.resolvedRequestType?.fullName.replace(/^\./, "") ?? method.requestType}`,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref: `#/components/schemas/${method.resolvedResponseType?.fullName.replace(/^\./, "") ?? method.responseType}`,
                },
              },
            },
          },
        },
      },
    };
  }
}
