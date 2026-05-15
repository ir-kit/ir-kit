import type { IR } from "@hey-api/shared";

export type EnumLiteral = string | number | boolean;

export function getEnumLiterals(schema: IR.SchemaObject): EnumLiteral[] {
  return (schema.items ?? [])
    .map((i) => i.const)
    .filter(
      (v): v is EnumLiteral =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean",
    );
}

export function isEnumSchema(schema: IR.SchemaObject): boolean {
  return schema.type === "enum";
}

/** anyOf / oneOf / allOf — items present, concrete type absent. */
export function isUnionSchema(schema: IR.SchemaObject): boolean {
  return Boolean(schema.items && schema.items.length > 0 && !schema.type);
}
