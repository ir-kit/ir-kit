import { isSchemaObject, type Schema } from "./types.js";

export type EnumLiteral = string | number | boolean;
export type EnumKind = "string" | "integer";

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
 * Throws on mixed shapes. The `name` is woven into the error so the
 * caller doesn't have to re-wrap.
 */
export function classifyEnumLiterals(
  values: ReadonlyArray<unknown>,
  name: string,
): EnumKind {
  const allStrings = values.every((v) => typeof v === "string");
  const allIntegers = values.every(
    (v) => typeof v === "number" && Number.isInteger(v),
  );
  if (!allStrings && !allIntegers) {
    throw new Error(
      `Enum ${name}: members must all be strings or all integers; got ${JSON.stringify(values)}`,
    );
  }
  return allIntegers ? "integer" : "string";
}

export interface EnumEntryIdent<T extends string | number> {
  identifier: string;
  raw: T;
}

/**
 * Throws if two raw values normalize to the same target identifier
 * (otherwise the emitted source won't compile). `noun` preserves the
 * per-target wording — Go/Kotlin say `entry name`, Swift says `case
 * name`; tests pin the exact phrase.
 */
export function assertNoEnumCollisions<T extends string | number>(
  schemaName: string,
  entries: Iterable<EnumEntryIdent<T>>,
  noun: "entry name" | "case name" = "entry name",
): void {
  const collisions = new Map<string, T[]>();
  for (const { identifier, raw } of entries) {
    const list = collisions.get(identifier) ?? [];
    list.push(raw);
    collisions.set(identifier, list);
  }
  for (const [identifier, raws] of collisions) {
    if (raws.length > 1) {
      const formatted = raws
        .map((r) => (typeof r === "string" ? `"${r}"` : String(r)))
        .join(", ");
      throw new Error(
        `Enum ${schemaName}: ${noun} "${identifier}" collides for raw values [${formatted}]`,
      );
    }
  }
}
