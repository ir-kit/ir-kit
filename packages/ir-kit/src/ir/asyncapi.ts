import type {
  AsyncAPIDocumentInterface,
  MessageInterface,
} from "@asyncapi/parser";

export interface AsyncAPISchemas {
  /** Component schemas plus one schema per message payload. */
  schemas: Record<string, unknown>;
  /** Message id to the key of its payload schema in `schemas`. */
  messages: Map<string, string>;
}

/**
 * Collect every named component schema and message payload of an AsyncAPI
 * document as OpenAPI 3.1 component schemas. The parser tags every component
 * schema with `x-parser-schema-id`, which turns its dereferenced copies back
 * into `$ref`s so named types survive.
 */
export function asyncapiSchemas(
  doc: AsyncAPIDocumentInterface,
  messageSuffix = "Message",
): AsyncAPISchemas {
  const components = Object.entries(doc.json().components?.schemas ?? {});
  // The parser tags component copies with `$id` when present, not the component key.
  const componentKeys = new Map(
    components.map(([key, json]) => [
      (json as Record<string, unknown>)["x-parser-schema-id"] as string,
      key,
    ]),
  );

  const schemas: Record<string, unknown> = {};
  for (const [key, json] of components) {
    schemas[key] = toOpenApiSchema(json, componentKeys, json);
  }

  const messages = new Map<string, string>();
  for (const message of doc.allMessages().all()) {
    const id = messageId(message);
    if (messages.has(id)) continue;
    const payload = message.payload();
    if (!payload) continue;
    const key = freeKey(`${id}${messageSuffix}`, schemas);
    schemas[key] = toOpenApiSchema(
      payloadJsonSchema(payload.json()),
      componentKeys,
    );
    messages.set(id, key);
  }

  return { schemas, messages };
}

/** A message's id. AsyncAPI 2.x inline messages with a `name` but no `messageId` have none, so they go by their name. */
export function messageId(message: MessageInterface): string {
  return message.id() ?? message.name();
}

/** An OpenAPI 3.1 document with no paths whose component schemas are the AsyncAPI document's message types. */
export function asyncapiToOpenAPI(
  doc: AsyncAPIDocumentInterface,
  messageSuffix?: string,
): Record<string, unknown> {
  const info = doc.info();
  return {
    openapi: "3.1.0",
    info: { title: info.title(), version: info.version() },
    paths: {},
    components: { schemas: asyncapiSchemas(doc, messageSuffix).schemas },
  };
}

/** Multi-format payloads (Avro, OpenAPI, …) keep the parser-converted JSON Schema under `schema`. */
function payloadJsonSchema(json: unknown): unknown {
  if (
    json &&
    typeof json === "object" &&
    "schemaFormat" in json &&
    "schema" in json
  ) {
    return json.schema;
  }
  return json;
}

/** Keywords whose value maps names to schemas, so its keys are data, not schema metadata. */
const SCHEMA_MAPS = new Set([
  "$defs",
  "definitions",
  "dependentSchemas",
  "patternProperties",
  "properties",
]);

/** Copy a dereferenced schema, turning nested component schemas back into `$ref`s and dropping parser bookkeeping. */
function toOpenApiSchema(
  node: unknown,
  componentKeys: ReadonlyMap<string, string>,
  root?: unknown,
  path = new Set<object>(),
): unknown {
  if (!node || typeof node !== "object") return node;
  const key = componentKeys.get(
    (node as Record<string, unknown>)["x-parser-schema-id"] as string,
  );
  if (node !== root && key) return { $ref: schemaRef(key) };
  // An anonymous schema that contains itself has no name to `$ref`.
  if (path.has(node)) return {};
  path.add(node);
  const recurse = (value: unknown) =>
    toOpenApiSchema(value, componentKeys, root, path);
  const copy = Array.isArray(node)
    ? node.map(recurse)
    : Object.fromEntries(
        Object.entries(node)
          .filter(
            ([name]) => !name.startsWith("x-parser-") && name !== "$schema",
          )
          .map(([name, value]) => [
            name,
            SCHEMA_MAPS.has(name) && value && typeof value === "object"
              ? Object.fromEntries(
                  Object.entries(value).map(([field, schema]) => [
                    field,
                    recurse(schema),
                  ]),
                )
              : recurse(value),
          ]),
      );
  path.delete(node);
  return copy;
}

export function schemaRef(key: string): string {
  return `#/components/schemas/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
}

function freeKey(key: string, taken: Record<string, unknown>): string {
  let candidate = key;
  for (let n = 2; candidate in taken; n++) candidate = `${key}${n}`;
  return candidate;
}
