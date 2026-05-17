# @ahmedrowaihi/k6-gen

## 1.0.2

### Patch Changes

- a92f011: `WalkedOperation` now exposes the OpenAPI `tags: ReadonlyArray<string>` on each yielded op. Pre-existing callers see no behavior change — the field is additive. Consumed by `@ahmedrowaihi/k6-toolkit`'s scaffolder to group ops by tag for the `--tags` batch mode.

## 1.0.1

### Patch Changes

- b924e63: Move `typescript` from `dependencies` to `peerDependencies` (range `>=5.0.0`).

  Eliminates the duplicate `typescript` install in consumer projects (one nested under k6-gen, one at the root) and lets `tsc` invocations from `k6-gen` use the consumer's compiler version. Aligns with the convention every TS codegen tool in the ecosystem uses.

## 1.0.0

### Major Changes

- b17e354: V2 — sync + async namespace per operation; runtime bridges; widened `CallOpts`.

  **Per-operation async variant**: every generated operation gets an async sibling under the `async` namespace export, calling `http.asyncRequest` for true Go-side parallelism via `Promise.all`:

  ```ts
  import * as api from "./gen/index.js";

  // sync — http.request
  const pet = api.getPet(1);

  // async — http.asyncRequest, returns Promise<Pet>
  const [pet, comments] = await Promise.all([
    api.async.getPet(1),
    api.async.getComments(1),
  ]);
  ```

  **Runtime bridges in the client preamble**: the generated client now installs the framework's bridges (`installK6Bridge`, `setExecModule`, `installMetricsFactory`) at module load so `flow.check`/`flow.group`/`flow.sleep` and `lt.metrics` work without users wiring anything by hand.

  **`CallOpts` widened**: per-request `opts` now includes `timeout`, `redirects`, `compression`, `responseType` (in addition to `headers` and `tags`). Forwarded directly to k6's request params.

  **Internal middleware integration**: generated operations now spread `applyMiddlewareParams()` into the request params object so digest/NTLM auth middleware works.

  Requires `@ahmedrowaihi/k6` ≥ 1.0 (v2).

## 0.2.3

### Patch Changes

- 008fdf4: Two cleanups for specs without any `components.schemas` (common with oRPC OpenAPI generators that inline every shape):

  - Generated `data.ts` no longer emits the dead `import { faker } from "@faker-js/faker"` (or the type-namespace import) when there's nothing to build — was tripping no-unused-imports lint rules downstream.
  - Generated `types.ts` now ends with `export {};` so tsc accepts it as a module — the umbrella `export * as types from "./types.js"` in `index.ts` was otherwise failing with "not a module" against the literally-empty file.

## 0.2.2

### Patch Changes

- 361d85f: Replace the per-package `$RefParser.bundle()` + `normalizeSpec()` boilerplate with a single `loadSpec()` call from `@ahmedrowaihi/openapi-tools`. URL inputs that previously got mangled when relative-resolved now pass through. Dropped the now-unused direct dep on `@hey-api/json-schema-ref-parser` from go/kotlin/swift/k6-gen — openapi-tools owns it transitively.
- Updated dependencies [361d85f]
  - @ahmedrowaihi/openapi-tools@1.4.0

## 0.2.1

### Patch Changes

- d8b5702: Drop the redundant `|| {}` fallback from spread in generated `applyMiddlewareHeaders` calls. Spreading `undefined`/`null` into an object literal is already a no-op; the fallback only existed to silence type-checkers and now trips `no-useless-fallback-in-spread` in downstream oxc-eslint setups.
- Updated dependencies [d8b5702]
  - @ahmedrowaihi/openapi-ts-faker@4.0.3

## 0.2.0

### Minor Changes

- cecb5ba: Emit the client entirely through TypeScript AST (`ts.factory` + `$` DSL) — no template strings. Runtime helpers move to `@ahmedrowaihi/k6/runtime` so generated files stay small. Types now arrive via `import type * as T from "./types.js"` with `T.Pet`-style references. Add `scaffold` option (`true` or `{ dir, clientImport }`) that emits one `loadtests/<op>.ts` skeleton per operation; pre-existing stubs are never overwritten. `generate()` now returns the parsed `ir` so downstream tools can run secondary passes.

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
