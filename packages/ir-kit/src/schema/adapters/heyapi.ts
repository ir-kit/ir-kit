import type { IR } from "@hey-api/shared";

import type { Schema, SchemaPrimitiveType } from "../types.js";

/**
 * Adapt `IR.SchemaObject` (hey-api's normalized intermediate form) to
 * canonical {@link Schema}.
 *
 * Normalizations:
 *  - `type:"enum"` + `items[].const` → `enum: [...]`
 *  - `type:"tuple"`                  → `type:"array"` + `prefixItems`
 *  - `type:"void"|"never"|"undefined"` → `type` left unset
 *  - `logicalOperator:"or"|"and"`      → `oneOf` / `allOf`
 *  - untyped + items[]                 → `oneOf` (hey-api's implicit
 *                                        union convention)
 */
export function fromHeyApi(s: IR.SchemaObject): Schema {
  const out: Schema = {};

  if (s.$ref) {
    out.$ref = s.$ref;
  } else {
    // hey-api's post-resolution marker for a generated symbol —
    // express it canonically as a $ref into `#/components/schemas`.
    const sym = (s as { symbolRef?: { name?: string } }).symbolRef;
    if (sym?.name) out.$ref = `#/components/schemas/${sym.name}`;
  }
  if (s.title) out.title = s.title;
  if (s.description) out.description = s.description;
  if (s.deprecated !== undefined) out.deprecated = s.deprecated;
  if (s.default !== undefined) out.default = s.default;
  if (s.format) out.format = s.format;
  if (s.pattern) out.pattern = s.pattern;
  if (s.minLength !== undefined) out.minLength = s.minLength;
  if (s.maxLength !== undefined) out.maxLength = s.maxLength;
  if (s.minimum !== undefined) out.minimum = s.minimum;
  if (s.maximum !== undefined) out.maximum = s.maximum;
  if (typeof s.exclusiveMinimum === "number")
    out.exclusiveMinimum = s.exclusiveMinimum;
  if (typeof s.exclusiveMaximum === "number")
    out.exclusiveMaximum = s.exclusiveMaximum;
  if (s.const !== undefined) out.const = s.const;

  if (s.logicalOperator === "and" && Array.isArray(s.items)) {
    out.allOf = s.items.map(fromHeyApi);
  } else if (s.logicalOperator === "or" && Array.isArray(s.items)) {
    out.oneOf = s.items.map(fromHeyApi);
  } else if (!s.type && Array.isArray(s.items) && s.items.length > 0) {
    out.oneOf = s.items.map(fromHeyApi);
  }

  if (s.properties) {
    out.properties = {};
    for (const [k, v] of Object.entries(s.properties)) {
      out.properties[k] = fromHeyApi(v);
    }
  }
  if (s.required && s.required.length > 0) out.required = [...s.required];
  if (s.additionalProperties !== undefined) {
    const ap = s.additionalProperties;
    if (typeof ap === "boolean") {
      out.additionalProperties = ap;
    } else if (
      ap.type === "never" ||
      ap.type === "void" ||
      ap.type === "undefined"
    ) {
      // hey-api represents `additionalProperties: false` as a never/void/
      // undefined-typed schema after normalization — collapse back to
      // the canonical boolean form so emitters can sealed-detect.
      out.additionalProperties = false;
    } else {
      out.additionalProperties = fromHeyApi(ap);
    }
  }

  switch (s.type) {
    case "enum": {
      const values = (s.items ?? [])
        .map((i) => i.const)
        .filter(
          (v): v is string | number | boolean =>
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean",
        );
      if (values.length > 0) out.enum = values;
      out.type = inferEnumType(values);
      break;
    }
    case "tuple": {
      out.type = "array";
      if (Array.isArray(s.items) && s.items.length > 0) {
        out.prefixItems = s.items.map(fromHeyApi);
      }
      break;
    }
    case "array": {
      out.type = "array";
      const elem = Array.isArray(s.items) ? s.items[0] : undefined;
      if (elem) out.items = fromHeyApi(elem);
      break;
    }
    case "void":
    case "never":
    case "undefined":
      break;
    case "object":
    case "string":
    case "number":
    case "integer":
    case "boolean":
    case "null":
      out.type = s.type;
      break;
  }

  return out;
}

function inferEnumType(
  values: ReadonlyArray<string | number | boolean>,
): SchemaPrimitiveType | undefined {
  if (values.every((v) => typeof v === "string")) return "string";
  if (values.every((v) => typeof v === "number" && Number.isInteger(v)))
    return "integer";
  if (values.every((v) => typeof v === "number")) return "number";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  return undefined;
}
