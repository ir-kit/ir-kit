import type { Symbol } from "@hey-api/codegen-core";
import { $, type MaybeTsDsl, type TypeTsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

import type { TypiaPlugin } from "../types.js";

export type RequestInputType = MaybeTsDsl<TypeTsDsl>;

/**
 * Emits `Data extends { [K]: unknown } ? [Data[K]] extends [undefined] ? unknown : Data[K] : unknown`.
 * Widens absent keys and `?: never` sections so HTTP adapters can pass `{}` / header bags
 * without tripping strict checks. Declared schemas fall through unchanged.
 */
function httpSectionFallback(data: Symbol, key: string): RequestInputType {
  const unknown = $.type("unknown");
  const value = $.type(data).idx($.type.literal(key));
  return $.type
    .ternary($.type(data))
    .extends($.type.object().prop(key, (p) => p.type(unknown)))
    .do(
      $.type
        .ternary($.type.tuple(value))
        .extends($.type.tuple($.type("undefined")))
        .do(unknown)
        .otherwise(value),
    )
    .otherwise(unknown);
}

export function queryDataTypeSymbol(
  plugin: TypiaPlugin["Instance"],
  operation: IR.OperationObject,
): Symbol | undefined {
  return plugin.querySymbol({
    category: "type",
    resource: "operation",
    resourceId: operation.id,
    role: "data",
    plugin: "@hey-api/typescript",
  });
}

export function queryResponseTypeSymbol(
  plugin: TypiaPlugin["Instance"],
  operation: IR.OperationObject,
): Symbol | undefined {
  return plugin.querySymbol({
    category: "type",
    resource: "operation",
    resourceId: operation.id,
    role: "response",
    plugin: "@hey-api/typescript",
  });
}

export function queryErrorsTypeSymbol(
  plugin: TypiaPlugin["Instance"],
  operation: IR.OperationObject,
): Symbol | undefined {
  return plugin.querySymbol({
    category: "type",
    resource: "operation",
    resourceId: operation.id,
    role: "errors",
    plugin: "@hey-api/typescript",
  });
}

export function buildRequestInputType(dataSymbol: Symbol): RequestInputType {
  const omitKeys = $.type.or(
    $.type.literal("url"),
    $.type.literal("path"),
    $.type.literal("body"),
    $.type.literal("query"),
    $.type.literal("headers"),
  );
  const stripped = $.type("Omit").generic($.type(dataSymbol)).generic(omitKeys);

  const sectionFallback = (key: string) => httpSectionFallback(dataSymbol, key);

  const overrides = $.type
    .object()
    .prop("params", (p) =>
      p.type($.type(dataSymbol).idx($.type.literal("path"))),
    )
    .prop("body", (p) => p.type(sectionFallback("body")))
    .prop("query", (p) => p.type(sectionFallback("query")))
    .prop("headers", (p) => p.type(sectionFallback("headers")));

  return $.type.and(stripped, overrides);
}
