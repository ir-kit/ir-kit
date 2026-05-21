import {
  classifyEnumLiterals,
  classifyObject,
  classifyUnion,
  type EnumLiteral,
  extractEnumValues,
  isSchemaObject,
  isUnionShape,
  iterateObjectProperties,
  type ObjectProperty,
  refName,
  type Schema,
} from "@ir-kit/schema";

import type { TypeCtx } from "./context.js";

/**
 * Per-target leaf operations the shared dispatchers (`schemaToType`,
 * `unionToType`, `inlineObjectType`) call into. `T` is the emitter's
 * target type (`GoType` / `KtType` / `SwType`), `D` its decl type.
 *
 * Each emitter writes one of these records. All per-target rendering
 * (pointer vs nullable, naming conventions, synthName joiner, decl
 * construction) lives here; the dispatchers stay neutral.
 */
export interface SchemaToTypeOps<T, D> {
  refType(name: string): T;
  arrayType(elem: T): T;
  mapType(valueType: T): T;
  /** Caller's "no return" analog — `goAny` (drops the result slot),
   *  `ktUnit`, `swVoid`. */
  voidType(): T;
  /** Caller's untyped fallback — `goAny` / `ktAny` / `swAny`. */
  anyType(): T;
  /** Standalone nullable-any — what `null`-typed primitives become. */
  nullableAnyType(): T;
  /** Wrap a known type in the target's optional wrapper for the union
   *  "single + nullable" path. Go's choice is conditional
   *  (`isPointerable`), so the hook receives both the inner type and
   *  the nullable bit. */
  wrapForUnionSingle(inner: T, nullable: boolean): T;
  /** Fallback type for unions with 2+ non-null branches. Go ignores
   *  `nullable` (interface already holds nil); Kotlin / Swift wrap. */
  unionFallback(nullable: boolean): T;
  /** Primitive dispatch. Returns `undefined` for non-primitive schemas
   *  so the outer dispatcher can fall through. */
  primitiveType(schema: Schema): T | undefined;
  /** Build a synth name from `ctx.ownerName` + `propPath`. Joiner is
   *  per-target — Go uses `""` to keep `go vet` quiet, Kotlin / Swift
   *  use `"_"`. */
  synthName(ownerName: string, propPath: ReadonlyArray<string>): string;
  buildStructDecl(
    name: string,
    properties: ReadonlyArray<ObjectProperty>,
    ctx: TypeCtx<D>,
    dispatch: (s: Schema, c: TypeCtx<D>) => T,
  ): D;
  emitStringEnum(
    name: string,
    raws: ReadonlyArray<string>,
    emit: (d: D) => void,
  ): T;
  emitIntegerEnum(
    name: string,
    raws: ReadonlyArray<number>,
    emit: (d: D) => void,
  ): T;
}

export function unionToType<T, D>(
  schema: Schema,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
  dispatch: (s: Schema, c: TypeCtx<D>) => T,
): T {
  const shape = classifyUnion(schema);
  switch (shape.kind) {
    case "intersection-with-properties":
      return inlineObjectType(schema, ctx, ops, dispatch);
    case "intersection-empty":
      return ops.anyType();
    case "single":
      return ops.wrapForUnionSingle(dispatch(shape.inner, ctx), shape.nullable);
    case "multi":
      return ops.unionFallback(shape.nullable);
  }
}

export function inlineObjectType<T, D>(
  schema: Schema,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
  dispatch: (s: Schema, c: TypeCtx<D>) => T,
): T {
  const shape = classifyObject(schema);
  switch (shape.kind) {
    case "named-struct": {
      const name = ops.synthName(ctx.ownerName, ctx.propPath);
      const properties = Array.from(iterateObjectProperties(schema));
      ctx.emit(ops.buildStructDecl(name, properties, ctx, dispatch));
      return ops.refType(name);
    }
    case "map":
      return ops.mapType(dispatch(shape.valueSchema, ctx));
    case "open-map":
      return ops.mapType(ops.anyType());
  }
}

/**
 * Top-level dispatch from a canonical {@link Schema} to a target type.
 * Routes each schema shape to the appropriate handler (`unionToType` /
 * `inlineObjectType` / per-target enum emitter / target leaf constructor).
 * Per-target leaf decisions live in `ops`.
 *
 * Dispatch order:
 *  1. `$ref` → named ref
 *  2. enum (`enum: [...]` or `oneOf`-of-consts)
 *  3. union shape (`oneOf` / `anyOf` / `allOf` / array-form `type`)
 *  4. primitive (per-target hook decides)
 *  5. compound by `type` (array / object / null)
 */
export function schemaToType<T, D>(
  schema: Schema,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
): T {
  const dispatch = (s: Schema, c: TypeCtx<D>): T => schemaToType(s, c, ops);

  if (schema.$ref) return ops.refType(refName(schema.$ref));

  const enumValues = extractEnumValues(schema);
  if (enumValues && enumValues.length > 0) {
    const name = ops.synthName(ctx.ownerName, ctx.propPath);
    const filtered = enumValues.filter(
      (v): v is EnumLiteral =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean",
    );
    const kind = classifyEnumLiterals(filtered, name);
    if (kind === "integer")
      return ops.emitIntegerEnum(name, filtered as number[], ctx.emit);
    return ops.emitStringEnum(name, filtered as string[], ctx.emit);
  }

  if (isUnionShape(schema)) return unionToType(schema, ctx, ops, dispatch);

  const primitive = ops.primitiveType(schema);
  if (primitive !== undefined) return primitive;

  const t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (t) {
    case "array": {
      const items = schema.items;
      return ops.arrayType(
        items && isSchemaObject(items)
          ? dispatch(items as Schema, ctx)
          : ops.anyType(),
      );
    }
    case "object":
      return inlineObjectType(schema, ctx, ops, dispatch);
    case "null":
      return ops.nullableAnyType();
    default:
      return ops.anyType();
  }
}
