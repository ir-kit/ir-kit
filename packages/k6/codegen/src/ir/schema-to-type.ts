import { $, type TsDsl } from "@hey-api/openapi-ts";
import {
  classifyUnion,
  extractEnumValues,
  isSchemaObject,
  isUnionShape,
  refName,
  type Schema,
} from "@ir-kit/openapi";
import ts from "typescript";

type TypeExpr = TsDsl<ts.TypeNode>;

export interface SchemaToTypeOpts {
  /** Namespace prefix for named refs (e.g. "T" → `T.Pet`). */
  typeNamespace?: string;
}

/**
 * Dispatch a canonical {@link Schema} to a TS `TypeNode` DSL expression.
 *
 * Dispatch order matters: `$ref`, `const`, `enum`, union shape, then
 * compound `type` (array / tuple / object), then primitive fallback.
 */
export function schemaToTypeNode(
  schema: Schema,
  opts: SchemaToTypeOpts = {},
): TypeExpr {
  if (schema.$ref) return $.type(qualify(refName(schema.$ref), opts));

  if (schema.const !== undefined) {
    return $.type.literal(schema.const as string | number | boolean | null);
  }

  const enumValues = extractEnumValues(schema);
  if (enumValues && enumValues.length > 0) return enumToUnion(enumValues);

  if (isUnionShape(schema)) {
    const u = classifyUnion(schema);
    if (u.kind === "single") {
      const inner = schemaToTypeNode(u.inner, opts);
      return u.nullable ? $.type.or(inner, $.type.literal(null)) : inner;
    }
    if (u.kind === "intersection-with-properties") {
      return objectToTypeLiteral(schema, opts);
    }
    if (u.kind === "intersection-empty") return $.type("unknown");
    const branches: TypeExpr[] = [];
    for (const b of [
      ...(schema.oneOf ?? []),
      ...(schema.anyOf ?? []),
      ...(schema.allOf ?? []),
    ]) {
      if (!isSchemaObject(b)) continue;
      if (b.type === "null") continue;
      branches.push(schemaToTypeNode(b as Schema, opts));
    }
    if (u.nullable) branches.push($.type.literal(null));
    return branches.length === 1 ? branches[0]! : $.type.or(...branches);
  }

  if (schema.type === "array") {
    const inner =
      schema.items && isSchemaObject(schema.items)
        ? schemaToTypeNode(schema.items as Schema, opts)
        : $.type("unknown");
    return arrayOf(inner);
  }
  if (Array.isArray(schema.prefixItems) && schema.prefixItems.length > 0) {
    return $.type.tuple(
      ...schema.prefixItems
        .filter(isSchemaObject)
        .map((s) => schemaToTypeNode(s as Schema, opts)),
    );
  }

  return primitiveToTypeNode(schema, opts);
}

function qualify(name: string, opts: SchemaToTypeOpts): string {
  return opts.typeNamespace ? `${opts.typeNamespace}.${name}` : name;
}

function primitiveToTypeNode(schema: Schema, opts: SchemaToTypeOpts): TypeExpr {
  const t = Array.isArray(schema.type)
    ? schema.type.find((x: string) => x !== "null")
    : schema.type;
  switch (t) {
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
    default:
      return $.type("unknown");
  }
}

function arrayOf(inner: TypeExpr): TypeExpr {
  return $.type("Array").generic(inner);
}

function enumToUnion(values: ReadonlyArray<unknown>): TypeExpr {
  if (!values.length) return $.type("string");
  const nodes = values
    .filter(
      (v): v is string | number | boolean =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean",
    )
    .map((v) => $.type.literal(v));
  if (!nodes.length) return $.type("string");
  return nodes.length === 1 ? nodes[0]! : $.type.or(...nodes);
}

export function objectToTypeLiteral(
  schema: Schema,
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
    if (!isSchemaObject(propSchema)) continue;
    const propType = schemaToTypeNode(propSchema as Schema, opts);
    obj = obj.prop(name, (p) => {
      const out = p.type(propType);
      return required.has(name) ? out : out.optional();
    });
  }
  if (additional && isSchemaObject(additional)) {
    obj = obj.idxSig(
      "key",
      (s) =>
        void s
          .key($.type("string"))
          .type(schemaToTypeNode(additional as Schema, opts)),
    );
  }
  return obj;
}
