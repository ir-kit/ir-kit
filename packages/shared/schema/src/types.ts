import type { JSONSchema, TypeName } from "json-schema-typed/draft-2020-12";

/**
 * Canonical schema model — re-exports of the JSON Schema 2020-12
 * typings from [`json-schema-typed`](https://www.npmjs.com/package/json-schema-typed).
 * Adapters fold each spec family (hey-api's `IR.SchemaObject`, raw
 * JSON Schema of any draft, OpenAPI 3.0 `nullable`) into this shape;
 * emitters consume only this.
 *
 * We add one OpenAPI-only extension (`discriminator`) since it's
 * common enough across the emitter surface to carry at the top level.
 */

/** Primitive type tags. Sourced from the upstream `TypeName` enum so
 *  values stay in sync with the spec. */
export type SchemaPrimitiveType = `${TypeName}`;

/** OpenAPI-only — emitters use it for tagged-union dispatch. Not part
 *  of vanilla JSON Schema. */
export interface SchemaDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

/**
 * Canonical schema node. Structurally `JSONSchema.Interface` (the
 * object form of `json-schema-typed`'s `JSONSchema` — i.e. the spec
 * type with the `true`/`false` schema booleans excluded) plus our
 * OpenAPI `discriminator` extension. Nested recursive fields
 * (`properties`, `items`, `oneOf`, `additionalProperties`, etc.) still
 * type to upstream `JSONSchema` (= `Interface | boolean`), per the
 * spec — guard for `boolean` at use sites.
 */
export type Schema = JSONSchema.Interface & {
  discriminator?: SchemaDiscriminator;
};

/** A nested schema slot per the spec — either an object schema or the
 *  `true`/`false` boolean schema. Equivalent to upstream `JSONSchema`. */
export type SchemaOrBool = JSONSchema;

/** Narrowing helper: a nested `SchemaOrBool` slot is a real object schema. */
export function isSchemaObject(s: SchemaOrBool): s is JSONSchema.Interface {
  return typeof s === "object" && s !== null;
}

export function isRefOnly(schema: Schema): schema is Schema & { $ref: string } {
  return typeof schema.$ref === "string";
}

/**
 * Normalize `schema.type` to an array form for uniform handling.
 * Returns `[]` for untyped schemas — those are typically composition
 * shells whose `type` is implied by `oneOf` / `anyOf`.
 */
export function typeList(schema: Schema): ReadonlyArray<SchemaPrimitiveType> {
  const t = schema.type;
  if (t === undefined) return [];
  if (Array.isArray(t)) return t as ReadonlyArray<SchemaPrimitiveType>;
  return [t as SchemaPrimitiveType];
}

/** True when the schema permits `null` — either via `type` containing
 *  `"null"` or via a `oneOf`/`anyOf` branch that is exactly
 *  `{ type: "null" }`. */
export function isNullable(schema: Schema): boolean {
  if (typeList(schema).includes("null")) return true;
  const branches = schema.oneOf ?? schema.anyOf;
  if (!branches) return false;
  return branches.some(
    (b) =>
      isSchemaObject(b) &&
      (b.type === "null" || (Array.isArray(b.type) && b.type.includes("null"))),
  );
}
