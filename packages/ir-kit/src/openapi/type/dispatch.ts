import type { Namespace } from "../../codegen/index.js";
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
} from "../../schema/index.js";

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
    names: Namespace,
  ): T;
  emitIntegerEnum(
    name: string,
    raws: ReadonlyArray<number>,
    emit: (d: D) => void,
    names: Namespace,
  ): T;
  /** Unions with 2+ non-null branches. Targets with a native sum type
   *  (e.g. protobuf `oneof`) build it here; others fall back to
   *  `unionFallback`. */
  multiUnion?(
    schema: Schema,
    ctx: TypeCtx<D>,
    dispatch: (s: Schema, c: TypeCtx<D>) => T,
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
      return ops.multiUnion
        ? ops.multiUnion(schema, ctx, dispatch)
        : ops.unionFallback(shape.nullable);
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
      const name = synthTypeName(ctx, ops);
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

  if (schema.$ref)
    return ops.refType(schemaTypeName(ctx.names, refName(schema.$ref)));

  const enumValues = extractEnumValues(schema);
  if (enumValues && enumValues.length > 0) {
    const literals = enumValues.filter(
      (v): v is EnumLiteral =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean",
    );
    const kind = classifyEnumLiterals(literals);
    const name =
      kind === "string" || kind === "integer" ? synthTypeName(ctx, ops) : "";
    return enumType(name, literals, ops, ctx).type;
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

/** Type name for the component schema `rawName` (`#/components/schemas/<rawName>`). */
export function schemaTypeName(names: Namespace, rawName: string): string {
  return names.claim(`schema:${rawName}`, rawName);
}

/** Type name for the inline schema at `ctx.ownerName` + `ctx.propPath`. */
export function synthTypeName<T, D>(
  ctx: TypeCtx<D>,
  ops: Pick<SchemaToTypeOps<T, D>, "synthName">,
  path: ReadonlyArray<string> = ctx.propPath,
): string {
  return ctx.names.claim(
    `synth:${ctx.ownerName}/${path.join("/")}`,
    ops.synthName(ctx.ownerName, path),
  );
}

/**
 * Map enum literals onto a target type. String / integer domains emit a
 * named enum (`named: true`); number / boolean domains become the
 * matching primitive and mixed domains the untyped fallback — those
 * leave `name` unused so the caller decides whether to alias it.
 */
export function enumType<T, D>(
  name: string,
  literals: ReadonlyArray<EnumLiteral>,
  ops: SchemaToTypeOps<T, D>,
  { emit, names }: Pick<TypeCtx<D>, "emit" | "names">,
): { type: T; named: boolean } {
  switch (classifyEnumLiterals(literals)) {
    case "string":
      return {
        type: ops.emitStringEnum(name, literals as string[], emit, names),
        named: true,
      };
    case "integer":
      return {
        type: ops.emitIntegerEnum(name, literals as number[], emit, names),
        named: true,
      };
    case "number":
      return {
        type: ops.primitiveType({ type: "number" }) ?? ops.anyType(),
        named: false,
      };
    case "boolean":
      return {
        type: ops.primitiveType({ type: "boolean" }) ?? ops.anyType(),
        named: false,
      };
    case "mixed":
      return { type: ops.anyType(), named: false };
  }
}
