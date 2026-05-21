import type { IR } from "@hey-api/shared";
import { refName } from "../spec/ref.js";

import type { TypeCtx } from "./context.js";
import {
  assertNoEnumCollisions,
  classifyEnumLiterals,
  type EnumLiteral,
} from "./enum.js";
import {
  classifyObjectShape,
  iterateObjectProperties,
  type ObjectProperty,
} from "./object.js";
import { classifyUnion } from "./union.js";

/**
 * Per-target leaf operations the shared dispatchers (schemaToType,
 * unionToType, inlineObjectType, buildEnumFromIR) call into. `T` is
 * the emitter's target type (GoType / KtType / SwType), `D` is its
 * decl type (GoDecl / KtDecl / SwDecl).
 *
 * Each emitter writes one of these records. Per-target rendering
 * (pointer vs nullable, naming conventions, synthName joiner,
 * decl-construction call shape) lives entirely here; the dispatchers
 * stay neutral.
 */
export interface SchemaToTypeOps<T, D> {
  // ── leaf type constructors ──────────────────────────────────────
  /** `$ref` → named target type. */
  refType(name: string): T;
  /** Array element → target array/slice/list type. */
  arrayType(elem: T): T;
  /** Open object's value type — target map's value-of-Any. */
  mapType(valueType: T): T;
  /** "No return" analog — `goAny` (Go callers drop the result slot),
   *  `ktUnit`, `swVoid`. */
  voidType(): T;
  /** Untyped fallback — `goAny` / `ktAny` / `swAny`. */
  anyType(): T;
  /** Standalone nullable-any — what `null`-typed primitives become.
   *  Go wraps any in pointer; Kotlin / Swift wrap in nullable/optional. */
  nullableAnyType(): T;
  /** Wrap a known type in the target's optional wrapper for the
   *  union "single + nullable" path. Go's choice is conditional
   *  (`isPointerable` check), so this hook receives both `nullable`
   *  and the bare inner type and decides. */
  wrapForUnionSingle(inner: T, nullable: boolean): T;
  /** Fallback type for unions with 2+ non-null branches.  Go ignores
   *  the nullable bit (`interface{}` already holds nil); Kotlin /
   *  Swift wrap if nullable. */
  unionFallback(nullable: boolean): T;

  /** Primitive dispatch (string, integer, number, boolean). Returns
   *  `undefined` for non-primitive schemas so the outer dispatcher
   *  can fall through to compound handling. */
  primitiveType(schema: IR.SchemaObject): T | undefined;

  // ── synth name ─────────────────────────────────────────────────
  /** Build a synth name from ctx.ownerName + propPath. Joiner is
   *  per-target — Go uses `""` to keep `go vet` quiet, Kotlin /
   *  Swift / TypeScript use `"_"`. */
  synthName(ownerName: string, propPath: ReadonlyArray<string>): string;

  // ── struct (named object) ──────────────────────────────────────
  /** Build a named struct/data-class/struct decl from an iterated
   *  property list. Per-target work: property identifier transform,
   *  optional wrapping, target field construction, annotation /
   *  coding-key emission. Returns the decl; the caller chooses to
   *  `emit` it (dispatcher does this; schema.ts also calls this
   *  directly for top-level component schemas). */
  buildStructDecl(
    name: string,
    properties: ReadonlyArray<ObjectProperty>,
    ctx: TypeCtx<D>,
    dispatch: (s: IR.SchemaObject, c: TypeCtx<D>) => T,
  ): D;

  // ── enum ───────────────────────────────────────────────────────
  /** Emit a string-typed enum decl and return a ref. Per-target work:
   *  case-identifier transform (Go `<Type><Raw>`, Kotlin
   *  `SCREAMING_SNAKE`, Swift `camel`), decl construction, runtime
   *  bookkeeping (`@SerialName`, `Codable` conformance). */
  emitStringEnum(
    name: string,
    raws: ReadonlyArray<string>,
    emit: (d: D) => void,
  ): T;
  /** Same for integer-typed enums. */
  emitIntegerEnum(
    name: string,
    raws: ReadonlyArray<number>,
    emit: (d: D) => void,
  ): T;
}

/**
 * Resolve a union-shaped `IR.SchemaObject` to a target type. Wraps
 * `classifyUnion` with per-target hooks for each branch.
 */
export function unionToType<T, D>(
  schema: IR.SchemaObject,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
  dispatch: (s: IR.SchemaObject, c: TypeCtx<D>) => T,
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

/**
 * Resolve an inline object schema to a target type. Three-way
 * dispatch via `classifyObjectShape`, then per-target rendering:
 *
 *  - named-struct → synth a name, build + emit struct, return ref
 *  - map          → wrap value type in the target's map
 *  - open-map     → map<string, any>
 */
export function inlineObjectType<T, D>(
  schema: IR.SchemaObject,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
  dispatch: (s: IR.SchemaObject, c: TypeCtx<D>) => T,
): T {
  const shape = classifyObjectShape(schema);
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
 * Top-level dispatch from `IR.SchemaObject` to a target type. Routes
 * each schema shape to the appropriate handler (`unionToType` /
 * `inlineObjectType` / per-target enum emitter / target leaf
 * constructor). The per-target leaf decisions live in `ops`.
 */
export function schemaToType<T, D>(
  schema: IR.SchemaObject,
  ctx: TypeCtx<D>,
  ops: SchemaToTypeOps<T, D>,
): T {
  const dispatch = (s: IR.SchemaObject, c: TypeCtx<D>): T =>
    schemaToType(s, c, ops);

  if (schema.$ref) return ops.refType(refName(schema.$ref));

  // Untyped item-bearing schema → union (oneOf/anyOf, possibly nullable).
  if (schema.items && schema.items.length > 0 && !schema.type) {
    return unionToType(schema, ctx, ops, dispatch);
  }

  const primitive = ops.primitiveType(schema);
  if (primitive !== undefined) return primitive;

  switch (schema.type) {
    case "array": {
      const elem = schema.items?.[0];
      return ops.arrayType(elem ? dispatch(elem, ctx) : ops.anyType());
    }
    case "tuple":
      return ops.arrayType(ops.anyType());
    case "enum": {
      const name = ops.synthName(ctx.ownerName, ctx.propPath);
      // Caller's emit walks the schema's `items[].const`; we surface
      // the typed list via the helper rather than re-defining the
      // literal-extraction here (lives in @ir-kit/openapi-tools).
      const rawValues = (schema.items ?? [])
        .map((i) => i.const)
        .filter(
          (v): v is EnumLiteral =>
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean",
        );
      // Collision enforcement is per-target (the identifiers differ),
      // so we hand off to the target's emitStringEnum / emitIntegerEnum
      // hook with the raw values; they call assertNoEnumCollisions
      // internally after computing their identifiers.
      const kind = classifyEnumLiterals(rawValues, name);
      if (kind === "integer")
        return ops.emitIntegerEnum(name, rawValues as number[], ctx.emit);
      return ops.emitStringEnum(name, rawValues as string[], ctx.emit);
    }
    case "object":
      return inlineObjectType(schema, ctx, ops, dispatch);
    case "null":
      return ops.nullableAnyType();
    case "never":
    case "void":
    case "undefined":
      return ops.voidType();
    default:
      return ops.anyType();
  }
}

// Re-export so emitters can import everything from one place.
export {
  assertNoEnumCollisions,
  classifyObjectShape,
  classifyUnion,
  iterateObjectProperties,
};
