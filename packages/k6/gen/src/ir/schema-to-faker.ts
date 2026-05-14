import {
  DATE_METHODS,
  DEFAULT_FORMAT_MAPPING,
  type FakerCallSpec,
  type PropertyInfo,
  resolveFakerCall,
} from "@ahmedrowaihi/openapi-ts-faker/core";
import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import type ts from "typescript";

import { refToTypeName, toPascalCase } from "./identifiers.js";

type Expr = TsDsl<ts.Expression>;

/**
 * Build a faker-backed expression that, when called, returns a value
 * matching the schema. Refs resolve to `data.<Type>()` so cycles stay
 * lazy. Format / field-name heuristics come from
 * `@ahmedrowaihi/openapi-ts-faker/core` so the source-of-truth stays
 * shared with the faker plugin.
 */
export function schemaToFakerExpr(
  schema: IR.SchemaObject,
  propName?: string,
): Expr {
  if (schema.$ref) return dataCall(refToTypeName(schema.$ref));
  if (schema.symbolRef) return dataCall(toPascalCase(schema.symbolRef.name));

  if (schema.const !== undefined) return literalExpr(schema.const);

  if (schema.items && schema.items.length) {
    if (schema.type === "array") {
      return $.array(schemaToFakerExpr(schema.items[0], propName));
    }
    if (schema.type === "tuple") {
      return $.array(
        ...schema.items.map((item, i) =>
          schemaToFakerExpr(item, `${propName ?? ""}_${i}`),
        ),
      );
    }
    return schemaToFakerExpr(schema.items[0], propName);
  }

  if (schema.type === "enum") return enumFaker(schema);
  if (schema.type === "object") return objectFaker(schema);
  if (schema.type === "null") return $.literal(null);
  if (schema.type === "array") return $.array();

  const spec = resolveFakerCall(schemaToPropertyInfo(schema, propName), {
    formatHints: DEFAULT_FORMAT_MAPPING,
    respectConstraints: false,
  });
  return fakerCallSpecToExpr(spec);
}

function dataCall(typeName: string): Expr {
  return $("data").attr(typeName).call();
}

function literalExpr(value: unknown): Expr {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return $.literal(value);
  }
  return $.literal(null);
}

function fakerCallSpecToExpr(spec: FakerCallSpec): Expr {
  if (spec.method === "__null__") return $.literal(null);

  const [mod, fn] = spec.method.split(".");
  const args: Expr[] = [];
  if (spec.args && Object.keys(spec.args).length > 0) {
    let obj = $.object();
    for (const [k, v] of Object.entries(spec.args)) {
      obj = obj.prop(k, $.literal(v as number));
    }
    args.push(obj);
  }
  const call = $("faker")
    .attr(mod!)
    .attr(fn!)
    .call(...args);
  // Date faker methods return Date objects; we want ISO strings.
  return DATE_METHODS.has(spec.method) ? call.attr("toISOString").call() : call;
}

function schemaToPropertyInfo(
  schema: IR.SchemaObject,
  propName?: string,
): PropertyInfo {
  return {
    type: schema.type ?? "string",
    format: typeof schema.format === "string" ? schema.format : undefined,
    name: propName ?? "",
    minimum: schema.minimum,
    maximum: schema.maximum,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
  };
}

function enumFaker(schema: IR.SchemaObject): Expr {
  const literals = (schema.items ?? [])
    .map((i) => i.const)
    .filter(
      (v): v is string | number | boolean => v !== undefined && v !== null,
    );
  if (!literals.length) return $.literal("");
  return $("faker")
    .attr("helpers")
    .attr("arrayElement")
    .call($.array(...literals.map((v) => literalExpr(v))));
}

function objectFaker(schema: IR.SchemaObject): Expr {
  let obj = $.object();
  for (const [name, propSchema] of Object.entries(schema.properties ?? {})) {
    obj = obj.prop(name, schemaToFakerExpr(propSchema, name));
  }
  return obj;
}
