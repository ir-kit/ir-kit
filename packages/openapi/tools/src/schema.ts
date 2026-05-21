import { extractEnumValues, isUnionShape, type Schema } from "@ir-kit/schema";

export type EnumLiteral = string | number | boolean;

export function getEnumLiterals(schema: Schema): EnumLiteral[] {
  const raw = extractEnumValues(schema) ?? [];
  return raw.filter(
    (v): v is EnumLiteral =>
      typeof v === "string" || typeof v === "number" || typeof v === "boolean",
  );
}

export function isEnumSchema(schema: Schema): boolean {
  const values = extractEnumValues(schema);
  return Boolean(values && values.length > 0);
}

export function isUnionSchema(schema: Schema): boolean {
  return isUnionShape(schema);
}
