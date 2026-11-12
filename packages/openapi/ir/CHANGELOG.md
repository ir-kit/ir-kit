# @ir-kit/openapi

## 0.4.0

### Minor Changes

- f869f1e: `loadOpenAPI` now gives every schema that is `$ref`'d from outside the components section (e.g. `#/paths/~1apps/get/.../properties/cors`) a home in `components.schemas` and rewrites those refs, so generators only ever see refs to declared components (`hoistForeignSchemaRefs`). Go names that would start with a digit are now `X`-prefixed so they stay exported, and struct fields that normalize to the same name are disambiguated.
- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.

### Patch Changes

- Updated dependencies [86fa954]
  - @ir-kit/codegen-core@0.2.0
  - @ir-kit/schema@0.3.0

## 0.3.0

### Minor Changes

- 64034d0: New package `@ir-kit/schema` — canonical JSON Schema 2020-12 IR shared across OpenAPI and AsyncAPI codegen families. `Schema` type is re-exported from [`json-schema-typed`](https://www.npmjs.com/package/json-schema-typed)'s `JSONSchema.Interface` (2020-12) so the spec surface stays current upstream. Includes codegen-specific classifiers (union/object/enum/primitive) and adapters from hey-api's `IR.SchemaObject` and raw JSON Schema (any draft).

  `@ir-kit/openapi`, `@ir-kit/openapi-{go,kotlin,swift}`, `@ir-kit/openapi-tools`, and `@ir-kit/k6-gen` now consume canonical `Schema` end-to-end. `SchemaToTypeOps.primitiveType`, `classifyReturnShape`, and emitter schema walkers all take canonical `Schema`; hey-api's `IR.SchemaObject` is converted at the spec→IR boundary via `fromHeyApi`. `classifyBody` now returns `{ shape, schema }` (schema pre-converted). Nested schema slots can be boolean schemas per the 2020-12 spec — guard with `isSchemaObject` when reading.

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/schema@0.2.0

## 0.2.0

### Minor Changes

- 3bf4075: Absorb `@ir-kit/openapi-core` — HTTP constants, ref helpers, security walkers, and the normalize pipeline now live under `@ir-kit/openapi/spec/` and re-export from `@ir-kit/openapi`. The old `@ir-kit/openapi-core` package is removed from the workspace and deprecated on npm; switch imports to `@ir-kit/openapi`.
