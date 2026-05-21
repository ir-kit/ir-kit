import type { Schema, SchemaPrimitiveType } from "../types.js";

export type JsonSchemaDialect =
  | "draft-04"
  | "draft-06"
  | "draft-07"
  | "2019-09"
  | "2020-12";

export interface FromJsonSchemaOptions {
  /** Source dialect — drives normalization of legacy quirks (boolean
   *  `exclusiveMinimum`, array-form `items` as tuple, `definitions` →
   *  `$defs`). Defaults to `2020-12` (pass-through). */
  dialect?: JsonSchemaDialect;
}

const PRIMITIVE_TYPES = new Set<SchemaPrimitiveType>([
  "string",
  "number",
  "integer",
  "boolean",
  "null",
  "object",
  "array",
]);

/**
 * Adapt raw JSON Schema (any draft) → canonical {@link Schema}. Pure
 * conversion: no validation, no ref resolution. Unknown keywords are
 * dropped. OpenAPI 3.0's `nullable: true` is folded into the type
 * array regardless of dialect (it's a common quirk).
 */
export function fromJsonSchema(
  raw: unknown,
  opts: FromJsonSchemaOptions = {},
): Schema {
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as Record<string, unknown>;
  const dialect = opts.dialect ?? "2020-12";
  const out: Schema = {};

  if (typeof r.$ref === "string") out.$ref = r.$ref;
  if (typeof r.title === "string") out.title = r.title;
  if (typeof r.description === "string") out.description = r.description;
  if (typeof r.deprecated === "boolean") out.deprecated = r.deprecated;
  if (typeof r.readOnly === "boolean") out.readOnly = r.readOnly;
  if (typeof r.writeOnly === "boolean") out.writeOnly = r.writeOnly;
  if (r.default !== undefined) out.default = r.default;
  if (typeof r.format === "string") out.format = r.format;
  if (typeof r.pattern === "string") out.pattern = r.pattern;
  if (typeof r.minLength === "number") out.minLength = r.minLength;
  if (typeof r.maxLength === "number") out.maxLength = r.maxLength;
  if (typeof r.minimum === "number") out.minimum = r.minimum;
  if (typeof r.maximum === "number") out.maximum = r.maximum;
  if (typeof r.multipleOf === "number") out.multipleOf = r.multipleOf;
  if (typeof r.minItems === "number") out.minItems = r.minItems;
  if (typeof r.maxItems === "number") out.maxItems = r.maxItems;
  if (typeof r.uniqueItems === "boolean") out.uniqueItems = r.uniqueItems;
  if (r.const !== undefined) out.const = r.const;
  if (Array.isArray(r.enum) && r.enum.length > 0) out.enum = r.enum;
  if (Array.isArray(r.examples)) out.examples = r.examples;
  if (Array.isArray(r.required)) {
    const req = r.required.filter((x): x is string => typeof x === "string");
    if (req.length > 0) out.required = req;
  }

  if (dialect === "draft-04") {
    if (r.exclusiveMinimum === true && typeof r.minimum === "number") {
      out.exclusiveMinimum = r.minimum;
    } else if (typeof r.exclusiveMinimum === "number") {
      out.exclusiveMinimum = r.exclusiveMinimum;
    }
    if (r.exclusiveMaximum === true && typeof r.maximum === "number") {
      out.exclusiveMaximum = r.maximum;
    } else if (typeof r.exclusiveMaximum === "number") {
      out.exclusiveMaximum = r.exclusiveMaximum;
    }
  } else {
    if (typeof r.exclusiveMinimum === "number")
      out.exclusiveMinimum = r.exclusiveMinimum;
    if (typeof r.exclusiveMaximum === "number")
      out.exclusiveMaximum = r.exclusiveMaximum;
  }

  const nullable = r.nullable === true;
  if (typeof r.type === "string" && isPrimitiveTag(r.type)) {
    out.type = nullable && r.type !== "null" ? [r.type, "null"] : r.type;
  } else if (Array.isArray(r.type)) {
    const tags = r.type.filter(
      (t): t is SchemaPrimitiveType =>
        typeof t === "string" && isPrimitiveTag(t),
    );
    if (tags.length > 0) {
      out.type = nullable && !tags.includes("null") ? [...tags, "null"] : tags;
    }
  } else if (nullable) {
    out.type = ["null"];
  }

  if (Array.isArray(r.oneOf))
    out.oneOf = r.oneOf.map((b) => fromJsonSchema(b, opts));
  if (Array.isArray(r.anyOf))
    out.anyOf = r.anyOf.map((b) => fromJsonSchema(b, opts));
  if (Array.isArray(r.allOf))
    out.allOf = r.allOf.map((b) => fromJsonSchema(b, opts));
  if (r.not && typeof r.not === "object") out.not = fromJsonSchema(r.not, opts);

  if (r.properties && typeof r.properties === "object") {
    out.properties = {};
    for (const [k, v] of Object.entries(
      r.properties as Record<string, unknown>,
    )) {
      out.properties[k] = fromJsonSchema(v, opts);
    }
  }
  if (r.patternProperties && typeof r.patternProperties === "object") {
    out.patternProperties = {};
    for (const [k, v] of Object.entries(
      r.patternProperties as Record<string, unknown>,
    )) {
      out.patternProperties[k] = fromJsonSchema(v, opts);
    }
  }
  if (typeof r.additionalProperties === "boolean") {
    out.additionalProperties = r.additionalProperties;
  } else if (
    r.additionalProperties &&
    typeof r.additionalProperties === "object"
  ) {
    out.additionalProperties = fromJsonSchema(r.additionalProperties, opts);
  }
  if (r.propertyNames && typeof r.propertyNames === "object") {
    out.propertyNames = fromJsonSchema(r.propertyNames, opts);
  }

  if (Array.isArray(r.items)) {
    out.prefixItems = r.items.map((b) => fromJsonSchema(b, opts));
  } else if (r.items && typeof r.items === "object") {
    out.items = fromJsonSchema(r.items, opts);
  }
  if (Array.isArray(r.prefixItems)) {
    out.prefixItems = r.prefixItems.map((b) => fromJsonSchema(b, opts));
  }

  const defs = (r.$defs ?? r.definitions) as
    | Record<string, unknown>
    | undefined;
  if (defs && typeof defs === "object") {
    out.$defs = {};
    for (const [k, v] of Object.entries(defs)) {
      out.$defs[k] = fromJsonSchema(v, opts);
    }
  }

  if (
    r.discriminator &&
    typeof r.discriminator === "object" &&
    typeof (r.discriminator as { propertyName?: unknown }).propertyName ===
      "string"
  ) {
    const d = r.discriminator as {
      propertyName: string;
      mapping?: Record<string, string>;
    };
    out.discriminator = {
      propertyName: d.propertyName,
      ...(d.mapping ? { mapping: d.mapping } : {}),
    };
  }

  return out;
}

function isPrimitiveTag(t: string): t is SchemaPrimitiveType {
  return PRIMITIVE_TYPES.has(t as SchemaPrimitiveType);
}
