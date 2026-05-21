import { $, type TsDsl } from "@hey-api/openapi-ts";
import {
  extractEnumValues,
  isSchemaObject,
  refName,
  type Schema,
} from "@ir-kit/openapi";
import {
  DATE_METHODS,
  DEFAULT_FORMAT_MAPPING,
  type FakerCallSpec,
  type PropertyInfo,
  resolveFakerCall,
} from "@ir-kit/openapi-ts-faker/core";
import type ts from "typescript";

type Expr = TsDsl<ts.Expression>;

/**
 * Build a faker-backed expression that, when called, produces a value
 * matching the schema. Refs resolve to `data.<Type>()` so cycles stay
 * lazy. Format / field-name heuristics route through
 * `@ir-kit/openapi-ts-faker/core` so the source-of-truth stays shared
 * with the faker plugin.
 */
export function schemaToFakerExpr(schema: Schema, propName?: string): Expr {
  if (schema.$ref) return dataCall(refName(schema.$ref));

  if (schema.const !== undefined) return literalExpr(schema.const);

  if (schema.type === "array") {
    return schema.items && isSchemaObject(schema.items)
      ? $.array(schemaToFakerExpr(schema.items as Schema, propName))
      : $.array();
  }
  if (Array.isArray(schema.prefixItems) && schema.prefixItems.length > 0) {
    return $.array(
      ...schema.prefixItems
        .filter(isSchemaObject)
        .map((item, i) =>
          schemaToFakerExpr(item as Schema, `${propName ?? ""}_${i}`),
        ),
    );
  }

  const enumValues = extractEnumValues(schema);
  if (enumValues && enumValues.length > 0) return enumFaker(enumValues);

  if (schema.type === "object") return objectFaker(schema);
  if (schema.type === "null") return $.literal(null);

  const firstBranch = (schema.oneOf ?? schema.anyOf ?? schema.allOf)?.find(
    (b) => isSchemaObject(b) && b.type !== "null",
  );
  if (firstBranch && isSchemaObject(firstBranch))
    return schemaToFakerExpr(firstBranch as Schema, propName);

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
  return DATE_METHODS.has(spec.method) ? call.attr("toISOString").call() : call;
}

function schemaToPropertyInfo(schema: Schema, propName?: string): PropertyInfo {
  const t = Array.isArray(schema.type)
    ? schema.type.find((x: string) => x !== "null")
    : schema.type;
  return {
    type: t ?? "string",
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

function enumFaker(values: ReadonlyArray<unknown>): Expr {
  if (!values.length) return $.literal("");
  return $("faker")
    .attr("helpers")
    .attr("arrayElement")
    .call($.array(...values.map((v) => literalExpr(v))));
}

function objectFaker(schema: Schema): Expr {
  let obj = $.object();
  for (const [name, propSchema] of Object.entries(schema.properties ?? {})) {
    if (!isSchemaObject(propSchema)) continue;
    obj = obj.prop(name, schemaToFakerExpr(propSchema as Schema, name));
  }
  return obj;
}
