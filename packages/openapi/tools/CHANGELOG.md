# @ahmedrowaihi/openapi-tools

## 1.4.0

### Minor Changes

- 361d85f: Add `loadSpec({ input, cwd, normalize })` — the single-source spec loader every generator now consumes. Handles path-vs-URL detection (relative paths resolved against `cwd`, URLs and absolute paths pass through), `$RefParser.bundle()`, and the optional safe-normalize pass. Also exports `resolveSpecInput()` for callers who only need the path/URL normalization. Promoted `@hey-api/json-schema-ref-parser` and `@ahmedrowaihi/openapi-core` to runtime deps so consumers get them transitively.

## 1.3.0

### Minor Changes

- 6cb0943: Add `getEnumLiterals`, `isEnumSchema`, `isUnionSchema` helpers for IR schema introspection. Lets downstream generators share the `items[].const` extraction and the `items && !type` union shape predicate instead of re-implementing them per target language.

## 1.2.1

### Patch Changes

- 5401075: Renamed `@ahmedrowaihi/oas-core` to `@ahmedrowaihi/openapi-core`; merged `@ahmedrowaihi/aas-core` and `@ahmedrowaihi/asyncapi-tools` into a single `@ahmedrowaihi/asyncapi-core`. Repository layout regrouped under `packages/{shared,openapi,asyncapi}/*`; `asyncapi-typescript` split its internal `lib/` into `runtime/` and `ast/`.

## 1.2.0

### Minor Changes

- ff66df8: Add `/merge` subpath: folds N OpenAPI 3.x specs into one with policy-driven conflict resolution for paths, components, tags, and servers; rewrites `$ref`s consistently so the output is a self-contained 3.1 doc.

## 1.1.0

### Minor Changes

- 5d66302: **New plugin `@ahmedrowaihi/openapi-ts-paths`** — emits one runtime `const` per operation (named after the operationId, suffixed `Route`) holding `{ spec, pattern, method, operationId }`. Per-operation exports keep the codegen output tree-shakable: `import { getPetByIdRoute } from "./generated/paths.gen"` pulls just that route.

  **`@ahmedrowaihi/openapi-tools` adds runtime routing** — pure, tree-shakable, accepts standard `Request`. Subpath exports:

  - `/match` → `match(routes, request)` returns a discriminated union typed by the route array, `isInSpec(routes, request)` boolean check
  - `/router` → `createRouter().on(route, handler).handle(request)` for typed handler dispatch (no upfront array; routes accumulate as you register)
  - `/parse`, `/diff`, `/ir` for spec parsing, diffing, and extracting `Route[]` from a parsed IR (backend dynamic-spec flow)
  - `sideEffects: false` for clean tree-shaking

## 1.0.0

### Major Changes

- 8fec7d2: Extracted spec-host-agnostic tooling (diff + parse) from the `@ahmedrowaihi/openapi-ts-orpc/tools` subpath into a new top-level package `@ahmedrowaihi/openapi-tools`.

  Breaking change for orpc consumers using `import ... from "@ahmedrowaihi/openapi-ts-orpc/tools"` — switch to `@ahmedrowaihi/openapi-tools`. faker and typia bump alongside via lockstep; their APIs are unchanged.
