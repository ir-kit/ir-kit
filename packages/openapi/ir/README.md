# `@ir-kit/openapi`

Language-agnostic IR-walking primitives for OpenAPI codegen. This package owns all the **pre-work** every native-SDK emitter needs (parsing the spec into shape, classifying schemas / responses / bodies, iterating paths × methods, deriving canonical names, walking template strings). Per-language emitters (`@ir-kit/openapi-{go,kotlin,swift}`) consume these primitives + provide their own **render** layer, never re-walking the spec themselves.

The shape of the consolidation:

```
                 IR.SchemaObject / IR.OperationObject (hey-api shared types)
                                    │
                                    ▼
                       @ir-kit/openapi (this package)
                       ┌────────────────────────────┐
                       │ pure walks:                │
                       │   iterOperations           │
                       │   collectLocatedParams     │
                       │   classifyBody             │
                       │   classifyReturnShape      │
                       │   classifyUnion            │
                       │   classifyObjectShape      │
                       │   classifyEnumLiterals     │
                       │   iterateObjectProperties  │
                       │   parseTemplatedSegment    │
                       │   splitPathSegments        │
                       │   deriveBaseName           │
                       │   ...                      │
                       │                            │
                       │ generic dispatchers:       │
                       │   schemaToType<T,D>(...)   │
                       │   unionToType<T,D>(...)    │
                       │   inlineObjectType<T,D>(.) │
                       └────────────┬───────────────┘
                                    │ ops: SchemaToTypeOps<T, D>
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
     @ir-kit/openapi-go    @ir-kit/openapi-kotlin   @ir-kit/openapi-swift
     ┌──────────────────┐  ┌──────────────────┐    ┌──────────────────┐
     │ goOps (renders): │  │ ktOps (renders): │    │ swOps (renders): │
     │  • goPtr/goSlice │  │  • ktNullable    │    │  • swOptional    │
     │  • goStruct      │  │  • ktDataClass   │    │  • swStruct      │
     │  • const blocks  │  │  • @Serializable │    │  • CodingKeys    │
     │  • net/http      │  │  • OkHttp        │    │  • URLSession    │
     └──────────────────┘  └──────────────────┘    └──────────────────┘
```

## Why a shared dispatcher

Before this package existed, each of the three native emitters had a full copy of `schemaToType`, `unionToType`, `inlineObjectType`, `buildEnumFromIR`, `typeForPrimitive` — plus their own walks over the spec. About 900 LOC of nearly-identical control flow per emitter (~2.7k total) drifted constantly: one emitter would gain a fix the others missed; one would use `pascal(jsonKey)` and another would use `safeIdent(jsonKey)` for the same role.

Consolidating into `@ir-kit/openapi` + a per-emitter `SchemaToTypeOps<T, D>` record means:

- **One source of truth for spec walks.** Adding a new OpenAPI feature (e.g. handling `discriminator`) lands in one file; all emitters pick it up.
- **Per-target rendering stays per-target.** Go's pointer-wrap is in `goOps.wrapForUnionSingle`; Kotlin's nullable wrap is in `ktOps.wrapForUnionSingle`. Neither leaks into the other; the dispatcher doesn't care which one is "right".
- **Type-safety on the contract.** `SchemaToTypeOps<T, D>` is generic over the target type `T` (`GoType` / `KtType` / `SwType`) and decl type `D`. Each emitter gets type errors at compile time if it omits a hook or returns the wrong shape.

## The `SchemaToTypeOps<T, D>` interface

Every emitter implements ~13 hooks in one record (`packages/openapi/<lang>/src/ir/type-ops.ts`):

```ts
interface SchemaToTypeOps<T, D> {
  // Leaf constructors
  refType(name: string): T;
  arrayType(elem: T): T;
  mapType(value: T): T;
  voidType(): T;
  anyType(): T;
  nullableAnyType(): T;
  wrapForUnionSingle(inner: T, nullable: boolean): T;
  unionFallback(nullable: boolean): T;
  primitiveType(schema: IR.SchemaObject): T | undefined;

  // Naming
  synthName(ownerName: string, propPath: ReadonlyArray<string>): string;

  // Composites (the dispatcher calls these when it sees the matching shape)
  buildStructDecl(
    name: string,
    properties: ReadonlyArray<ObjectProperty>,
    ctx: TypeCtx<D>,
    dispatch: (s: IR.SchemaObject, c: TypeCtx<D>) => T,
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
```

Hooks receive `dispatch` so they can recurse back into `schemaToType` when they need an inner type — e.g. `buildStructDecl` calls `dispatch(propSchema, childCtx)` for every property.

## Reading order

If you're picking up this package for the first time:

1. **`src/type/dispatch.ts`** — the `schemaToType<T, D>` function and the `SchemaToTypeOps<T, D>` interface. Start here.
2. **`packages/openapi/go/src/ir/type-ops.ts`** — concrete implementation of every hook. Smallest of the three emitters; the simplest read.
3. **`src/type/{union,object,enum}.ts`** — the classifiers the dispatcher uses (`classifyUnion`, `classifyObjectShape`, `classifyEnumLiterals`, `iterateObjectProperties`, `assertNoEnumCollisions`). Pure functions over hey-api's IR.
4. **`src/operation/*`** — operation-level walks (`iterOperations`, `collectLocatedParams`, `successResponses`, `classifyReturnShape`, `parseTemplatedSegment`, `deriveBaseName`, etc.). Each emitter's per-tag method generation calls into these.

## Conventions

- **Pre-work belongs here. Render belongs per-emitter.** When you find a `Object.entries(schema.properties).filter(...)` chain open-coded in two emitters, it goes here. When you find a `goPtr` / `ktNullable` / `swOptional` choice, it stays per-emitter.

- **Classifiers return tagged-union shapes.** `classifyBody(body) → BodyShape`, `classifyUnion(schema) → UnionShape`, `classifyReturnShape(op) → ReturnShape`. Callers switch on `kind`. Adding a new variant ripples through the type checker so every consumer either handles it or fails to compile.

- **Walks are generators, not arrays.** `iterOperations`, `iterateObjectProperties`. Lets callers short-circuit or filter without paying for a full list build. Callers that need an array do `Array.from(...)`.

- **No target imports.** This package depends on `@hey-api/shared` (for IR types) and `@ir-kit/codegen-core` (for `pascal`, `synthName`). Spec-level primitives (ref / security / constants / normalize) live under `src/spec/` and are re-exported. The package does NOT depend on any go-dsl / kt-dsl / sw-dsl module.

## Adding a new shared walk

When you spot duplication in `@ir-kit/openapi-{go,kotlin,swift}`:

1. Identify the **pre-work** (what does the IR walk produce that's target-neutral?) vs the **render** (what's the target-specific shape it gets wrapped in?).
2. Add the pre-work helper to this package — pure function, generator, or classifier.
3. Update each emitter to consume it. Verify the petstore SDK regen is byte-identical (the repo's `examples/openapi-sdk-petstore/` is the canonical fixture).
4. Land in one commit per emitter pass for clean git history.

If the duplication is in render — different code paths producing structurally-different target code — it stays per-emitter. Push back on consolidating principled language differences just because they look similar.

## Status

`0.1.0` ships the dispatcher + ~16 pre-work helpers + the `SchemaToTypeOps` interface. The three native SDK emitters (`@ir-kit/openapi-{go,kotlin,swift}`) consume it; the TypeScript emitter (`@ir-kit/openapi-typescript`) wraps `@hey-api/openapi-ts` and bypasses the dispatcher entirely (hey-api owns its own IR walk).

Petstore SDK output for go + swift is byte-identical pre- and post-consolidation across all dispatcher migrations — this is the regression bar.
