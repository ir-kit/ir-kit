# @ahmedrowaihi/k6-gen

## 0.1.1

### Patch Changes

- 6cb0943: Fix enum types collapsing to `string | string | string` and invalid identifiers like `0Enum`. Type emitter now dispatches on `schema.const` and `type === "enum"` before the union branch (mirrors the faker side), preserving literal values. Schema-name slots use `safeIdent` from `@ahmedrowaihi/codegen-core`, so hey-api-generated names beginning with a digit become legal TS identifiers. Multi-name type imports wrap onto separate lines.
- Updated dependencies [6cb0943]
  - @ahmedrowaihi/openapi-tools@1.3.0

## 0.1.0

### Minor Changes

- 6c9e57d: Introduce the k6 load-testing track: a framework (`defineLoadTest`, `flow().step()`, pace presets, budgets, `useAuth` middleware), a standalone generator (`k6-gen.generate`) emitting a typed client + data builders, a CLI (`k6-tools init/sync/run`), and a thin hey-api plugin wrapper.

### Patch Changes

- Updated dependencies [6c9e57d]
  - @ahmedrowaihi/openapi-ts-faker@4.0.2
