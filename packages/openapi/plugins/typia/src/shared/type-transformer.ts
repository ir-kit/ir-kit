import type { Symbol } from "@hey-api/codegen-core";
import {
  $,
  type MaybeTsDsl,
  type TypeTransformer,
  type TypeTsDsl,
} from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

import {
  TYPIA_FORMAT_VALUES,
  TYPIA_INTEGER_FORMATS,
  TYPIA_TAG_META,
  type TypiaTagName,
} from "./typia-tags.generated.js";

type OpenApiTarget = "array" | "number" | "string";

/** Tags we emit from OpenAPI constraints. `(kind, targets)` comes from `TYPIA_TAG_META`. */
const HANDLED_TAGS = [
  "ExclusiveMaximum",
  "ExclusiveMinimum",
  "Format",
  "MaxItems",
  "MaxLength",
  "Maximum",
  "MinItems",
  "MinLength",
  "Minimum",
  "MultipleOf",
  "Pattern",
  "Type",
  "UniqueItems",
] as const satisfies ReadonlyArray<TypiaTagName>;

const SKIPPED_TAGS = [
  "Constant",
  "ContentMediaType",
  "Default",
  "Example",
  "Examples",
  "JsonSchemaPlugin",
  "Sequence",
  "TagBase",
] as const satisfies ReadonlyArray<TypiaTagName>;

/** Every typia tag must be handled or skipped; regen + this gate catches new tags. */
type _Unaccounted = Exclude<
  TypiaTagName,
  (typeof HANDLED_TAGS)[number] | (typeof SKIPPED_TAGS)[number]
>;
const _tagCoverage: [_Unaccounted] extends [never]
  ? true
  : { readonly unaccountedTypiaTag: _Unaccounted } = true;
void _tagCoverage;

const TYPIA_TO_OPENAPI_TARGET: Readonly<
  Record<string, ReadonlyArray<OpenApiTarget>>
> = {
  array: ["array"],
  bigint: ["number"],
  number: ["number"],
  string: ["string"],
};

const INTEGER_FORMATS: ReadonlySet<string> = new Set(TYPIA_INTEGER_FORMATS);
const TYPIA_FORMATS: ReadonlySet<string> = new Set(TYPIA_FORMAT_VALUES);

/** Emission plan: for each OpenAPI target, the tags that apply + their schema fields. */
const TAG_PLAN: Readonly<
  Record<OpenApiTarget, ReadonlyArray<{ field: string; name: TypiaTagName }>>
> = (() => {
  const plan: Record<
    OpenApiTarget,
    Array<{ field: string; name: TypiaTagName }>
  > = {
    array: [],
    number: [],
    string: [],
  };
  for (const name of HANDLED_TAGS) {
    const meta = TYPIA_TAG_META[name];
    if (!meta.kind) continue;
    const apiTargets = new Set<OpenApiTarget>();
    for (const typiaTarget of meta.targets) {
      for (const mapped of TYPIA_TO_OPENAPI_TARGET[typiaTarget] ?? []) {
        apiTargets.add(mapped);
      }
    }
    for (const apiTarget of apiTargets) {
      plan[apiTarget].push({ field: meta.kind, name });
    }
  }
  return plan;
})();

type TypeExpr = MaybeTsDsl<TypeTsDsl>;
type TransformerContext = Parameters<TypeTransformer>[0];

const tagsSymbols = new WeakMap<object, Symbol>();

function tagsSymbol(plugin: TransformerContext["plugin"]): Symbol {
  let symbol = tagsSymbols.get(plugin);
  if (!symbol) {
    symbol = plugin.symbolFactory.register("tags", {
      external: "typia",
      meta: { category: "external", resource: "typia.tags" },
    });
    tagsSymbols.set(plugin, symbol);
  }
  return symbol;
}

function transform(ctx: TransformerContext): TypeExpr | undefined {
  const { schema } = ctx;
  const tags = () => tagsSymbol(ctx.plugin);

  if (schema.type === "string") {
    const tagNodes = collectTags(schema, "string", tags);
    return tagNodes.length
      ? $.type.and($.type("string"), ...tagNodes)
      : undefined;
  }

  if (schema.type === "integer" || schema.type === "number") {
    const tagNodes = collectTags(schema, "number", tags);
    return tagNodes.length
      ? $.type.and($.type("number"), ...tagNodes)
      : undefined;
  }

  if (schema.type === "array") {
    const tagNodes = collectTags(schema, "array", tags);
    if (!tagNodes.length) return;

    const itemType = buildArrayItemType(ctx);
    if (!itemType) return;

    return $.type.and($.type("Array").generic(itemType), ...tagNodes);
  }

  return;
}

/**
 * Annotates a schema's generated TypeScript type with typia constraint
 * tag intersections. Register on `@hey-api/transformers.typeTransformers`.
 */
// `TypeTransformer` is typed to return only a type reference, but tags need an
// intersection, and the typescript plugin accepts any type node.
export const typiaTypeTransformer = transform as unknown as TypeTransformer;

function collectTags(
  schema: IR.SchemaObject,
  target: OpenApiTarget,
  tags: () => Symbol,
): Array<TypeExpr> {
  const out: Array<TypeExpr> = [];
  for (const { field, name } of TAG_PLAN[target]) {
    const value = (schema as Record<string, unknown>)[field];
    if (value == null) continue;

    if (name === "Type") {
      if (
        schema.type !== "integer" ||
        typeof value !== "string" ||
        !INTEGER_FORMATS.has(value)
      ) {
        continue;
      }
    } else if (name === "Format") {
      if (typeof value !== "string") continue;
      if (INTEGER_FORMATS.has(value)) continue;
      if (!TYPIA_FORMATS.has(value)) continue;
    } else if (name === "UniqueItems") {
      if (value !== true) continue;
      out.push($.type(tags()).attr("UniqueItems"));
      continue;
    }

    out.push(
      $.type(tags())
        .attr(name)
        .generic($.type.literal(value as number | string)),
    );
  }
  return out;
}

function buildArrayItemType(ctx: TransformerContext): TypeExpr | null {
  const items = ctx.schema.items;
  if (!items || items.length === 0) return $.type("unknown");
  const mapped = items.map(
    (item) => transform({ ...ctx, schema: item }) ?? primitiveType(item),
  );
  if (!mapped.every((n) => n !== null)) return null;
  return mapped.length === 1 ? mapped[0]! : $.type.or(...mapped);
}

function primitiveType(schema: IR.SchemaObject): TypeExpr | null {
  switch (schema.type) {
    case "boolean":
      return $.type("boolean");
    case "integer":
    case "number":
      return $.type("number");
    case "string":
      return $.type("string");
    default:
      return null;
  }
}
