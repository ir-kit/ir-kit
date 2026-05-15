import { safeIdent } from "@ahmedrowaihi/codegen-core";
import {
  getEnumLiterals,
  isEnumSchema,
  isUnionSchema,
} from "@ahmedrowaihi/openapi-tools";
import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import ts from "typescript";

import { refToTypeName } from "./identifiers.js";

type TypeExpr = TsDsl<ts.TypeNode>;

// `.const` and `type === "enum"` MUST come before the items-bearing
// union branch — enum schemas carry both `type: "enum"` and items, and
// falling through to the union path collapses each item to its base
// type (`string | string | string` instead of the literal union).
export function schemaToTypeNode(schema: IR.SchemaObject): TypeExpr {
  if (schema.$ref) return $.type(refToTypeName(schema.$ref));
  if (schema.symbolRef) return $.type(safeIdent(schema.symbolRef.name));

  if (schema.const !== undefined) {
    return $.type.literal(schema.const as string | number | boolean | null);
  }

  if (isEnumSchema(schema)) return enumToUnion(schema);

  if (isUnionSchema(schema)) {
    const operator = schema.logicalOperator ?? "or";
    return combine(schema.items!.map(schemaToTypeNode), operator);
  }

  if (schema.items && schema.items.length) {
    if (schema.type === "array") {
      const inner =
        schema.items.length === 1
          ? schemaToTypeNode(schema.items[0])
          : combine(
              schema.items.map(schemaToTypeNode),
              schema.logicalOperator ?? "or",
            );
      return arrayOf(inner);
    }
    if (schema.type === "tuple") {
      return $.type.tuple(...schema.items.map(schemaToTypeNode));
    }
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
  const literals = getEnumLiterals(schema);
  if (!literals.length) return $.type("string");
  const nodes = literals.map((v) => $.type.literal(v));
  return nodes.length === 1 ? nodes[0] : $.type.or(...nodes);
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
