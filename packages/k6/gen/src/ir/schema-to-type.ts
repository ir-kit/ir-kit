import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import ts from "typescript";

import { refToTypeName, toPascalCase } from "./identifiers.js";

type TypeExpr = TsDsl<ts.TypeNode>;

/**
 * Map an IR schema to a TS type DSL node. Inline objects stay inline;
 * named refs / symbolRefs resolve to a type reference by name.
 */
export function schemaToTypeNode(schema: IR.SchemaObject): TypeExpr {
  if (schema.$ref) return $.type(refToTypeName(schema.$ref));
  if (schema.symbolRef) return $.type(toPascalCase(schema.symbolRef.name));

  if (schema.items && schema.items.length) {
    const operator = schema.logicalOperator ?? "or";
    if (schema.type === "array") {
      const inner =
        schema.items.length === 1
          ? schemaToTypeNode(schema.items[0])
          : combine(schema.items.map(schemaToTypeNode), operator);
      return arrayOf(inner);
    }
    if (schema.type === "tuple") {
      return $.type.tuple(...schema.items.map(schemaToTypeNode));
    }
    return combine(schema.items.map(schemaToTypeNode), operator);
  }

  switch (schema.type) {
    case "string":
      return $.type("string");
    case "integer":
    case "number":
      return $.type("number");
    case "boolean":
      return $.type("boolean");
    case "null":
      return $.type.literal(null);
    case "enum":
      return enumToUnion(schema);
    case "array":
      return arrayOf($.type("unknown"));
    case "object":
      return objectToTypeLiteral(schema);
    case "void":
    case "never":
    case "undefined":
      return $.type("undefined");
    default:
      return $.type("unknown");
  }
}

function arrayOf(inner: TypeExpr): TypeExpr {
  // The DSL doesn't ship a dedicated array builder for type-position, but
  // `Array<T>` renders identically to `T[]` after the printer's normalize pass.
  return $.type("Array").generic(inner);
}

function combine(types: TypeExpr[], operator: "and" | "or"): TypeExpr {
  if (types.length === 1) return types[0];
  return operator === "and" ? $.type.and(...types) : $.type.or(...types);
}

function enumToUnion(schema: IR.SchemaObject): TypeExpr {
  const items = schema.items ?? [];
  if (!items.length) return $.type("string");
  const literals = items
    .map((item) => item.const)
    .filter((v) => v !== undefined)
    .map((v) => $.type.literal(v as string | number | boolean | null));
  if (!literals.length) return $.type("string");
  return literals.length === 1 ? literals[0] : $.type.or(...literals);
}

export function objectToTypeLiteral(schema: IR.SchemaObject): TypeExpr {
  const required = new Set(schema.required ?? []);
  const propEntries = Object.entries(schema.properties ?? {});
  const additional = schema.additionalProperties;

  if (!propEntries.length && additional !== false) {
    return $.type("Record")
      .generic($.type("string"))
      .generic($.type("unknown"));
  }

  let obj = $.type.object();
  for (const [name, propSchema] of propEntries) {
    const propType = schemaToTypeNode(propSchema);
    obj = obj.prop(name, (p) => {
      const out = p.type(propType);
      return required.has(name) ? out : out.optional();
    });
  }
  if (additional && typeof additional === "object") {
    obj = obj.idxSig(
      "key",
      (s) => void s.key($.type("string")).type(schemaToTypeNode(additional)),
    );
  }
  return obj;
}
