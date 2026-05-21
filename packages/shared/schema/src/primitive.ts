import type { Schema, SchemaPrimitiveType } from "./types.js";
import { typeList } from "./types.js";

const PRIMITIVE_TAGS = new Set<SchemaPrimitiveType>([
  "string",
  "number",
  "integer",
  "boolean",
  "null",
]);

export function isPrimitiveTag(t: SchemaPrimitiveType): boolean {
  return PRIMITIVE_TAGS.has(t);
}

export function isPrimitive(schema: Schema): boolean {
  const tags = typeList(schema).filter((t) => t !== "null");
  return tags.length === 1 && isPrimitiveTag(tags[0]!);
}

/** Sole non-null primitive tag, or `undefined` if the schema is
 *  compound / multi-typed / null-only. */
export function primitiveTag(schema: Schema): SchemaPrimitiveType | undefined {
  const tags = typeList(schema).filter((t) => t !== "null");
  if (tags.length !== 1) return undefined;
  return isPrimitiveTag(tags[0]!) ? tags[0] : undefined;
}
