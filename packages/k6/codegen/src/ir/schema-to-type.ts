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

export interface SchemaToTypeOpts {
  /** Namespace prefix for named refs (e.g. "T" → `T.Pet`). Default none. */
  typeNamespace?: string;
}

// Dispatch order: `.const` and `type === "enum"` MUST come before the
// items branch. Enum schemas carry both `type: "enum"` and items, and
// falling through to union collapses each item to its base type
// (`string | string | string`).
export function schemaToTypeNode(
  schema: IR.SchemaObject,
  opts: SchemaToTypeOpts = {},
): TypeExpr {
  if (schema.$ref) return $.type(qualify(refToTypeName(schema.$ref), opts));
  if (schema.symbolRef) {
    return $.type(qualify(safeIdent(schema.symbolRef.name), opts));
  }

  if (schema.const !== undefined) {
    return $.type.literal(schema.const as string | number | boolean | null);
  }

  if (isEnumSchema(schema)) return enumToUnion(schema);

  if (isUnionSchema(schema)) {
    const operator = schema.logicalOperator ?? "or";
    return combine(
      schema.items!.map((s) => schemaToTypeNode(s, opts)),
      operator,
    );
  }

  if (schema.items && schema.items.length) {
    if (schema.type === "array") {
      const inner =
        schema.items.length === 1
          ? schemaToTypeNode(schema.items[0], opts)
          : combine(
              schema.items.map((s) => schemaToTypeNode(s, opts)),
              schema.logicalOperator ?? "or",
            );
      return arrayOf(inner);
    }
    if (schema.type === "tuple") {
      return $.type.tuple(
        ...schema.items.map((s) => schemaToTypeNode(s, opts)),
      );
    }
  }

  return primitiveToTypeNode(schema, opts);
}

function qualify(name: string, opts: SchemaToTypeOpts): string {
  return opts.typeNamespace ? `${opts.typeNamespace}.${name}` : name;
}

function primitiveToTypeNode(
  schema: IR.SchemaObject,
  opts: SchemaToTypeOpts,
): TypeExpr {
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
      return objectToTypeLiteral(schema, opts);
    case "void":
    case "never":
    case "undefined":
      return $.type("undefined");
    default:
      return $.type("unknown");
  }
}

function arrayOf(inner: TypeExpr): TypeExpr {
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

export function objectToTypeLiteral(
  schema: IR.SchemaObject,
  opts: SchemaToTypeOpts = {},
): TypeExpr {
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
    const propType = schemaToTypeNode(propSchema, opts);
    obj = obj.prop(name, (p) => {
      const out = p.type(propType);
      return required.has(name) ? out : out.optional();
    });
  }
  if (additional && typeof additional === "object") {
    obj = obj.idxSig(
      "key",
      (s) =>
        void s.key($.type("string")).type(schemaToTypeNode(additional, opts)),
    );
  }
  return obj;
}
