import { Namespace } from "@ir-kit/codegen-core";

import { isSchemaObject, type Schema } from "./types.js";

export type EnumLiteral = string | number | boolean;
export type EnumKind = "string" | "integer" | "number" | "boolean" | "mixed";

/**
 * Extract enum literals from a schema. Recognises both explicit
 * `enum: [...]` and `oneOf`/`anyOf` of `{const}` branches. Returns
 * `undefined` when neither shape is present.
 */
export function extractEnumValues(
  schema: Schema,
): ReadonlyArray<unknown> | undefined {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum;
  const branches = schema.oneOf ?? schema.anyOf;
  if (!branches) return undefined;
  const consts: unknown[] = [];
  for (const b of branches) {
    if (!isSchemaObject(b)) return undefined;
    if (Object.hasOwn(b, "const")) consts.push(b.const);
    else return undefined;
  }
  return consts.length > 0 ? consts : undefined;
}

/**
 * The value domain of an enum's literals. `string` / `integer` become
 * real enums; `number` / `boolean` degrade to the matching primitive;
 * `mixed` (or empty) becomes the target's untyped fallback.
 */
export function classifyEnumLiterals(values: ReadonlyArray<unknown>): EnumKind {
  if (values.length === 0) return "mixed";
  if (values.every((v) => typeof v === "string")) return "string";
  if (values.every((v) => typeof v === "boolean")) return "boolean";
  if (values.every((v) => typeof v === "number")) {
    return values.every((v) => Number.isInteger(v)) ? "integer" : "number";
  }
  return "mixed";
}

export interface EnumEntryIdent<T extends string | number> {
  identifier: string;
  raw: T;
}

/**
 * Assign every distinct raw value its own identifier. Duplicate raws
 * collapse to one entry; raws whose identifiers clash (`"ASC"` / `"asc"`)
 * get deterministic suffixes from `disambiguate`.
 */
export function uniqueEnumEntries<T extends string | number>(
  raws: ReadonlyArray<T>,
  identifier: (raw: T) => string,
  disambiguate?: (base: string, n: number) => string,
): EnumEntryIdent<T>[] {
  const ns = new Namespace({ normalize: (s) => s, disambiguate });
  const seen = new Set<T>();
  const out: EnumEntryIdent<T>[] = [];
  for (const raw of raws) {
    if (seen.has(raw)) continue;
    seen.add(raw);
    out.push({ raw, identifier: ns.claim(String(raw), identifier(raw)) });
  }
  return out;
}
