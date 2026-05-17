# @ahmedrowaihi/k6-toolkit

## 0.5.0

### Minor Changes

- a92f011: Add `k6-ts scaffold` — interactive + flag-driven scenario generator.

  ```bash
  # Interactive wizard
  k6-ts scaffold

  # Discovery (agent-friendly)
  k6-ts scaffold list-ops --spec ./openapi.yaml [--json]

  # Flag-driven single scenario
  k6-ts scaffold --name browse-pets --ops findPetsByStatus,getPetById \
    --chain sequential --pace smoke --output ./loadtests/browse-pets.ts

  # Batch — one scenario per tag
  k6-ts scaffold --spec ./openapi.yaml --tags pet,user --output-dir ./loadtests
  ```

  Reuses every existing primitive: `loadSpec()` + `parseSpec()` from `@ahmedrowaihi/openapi-tools`, `walkOperations()` from `@ahmedrowaihi/k6-gen` (now exposing OpenAPI `tags`), and the AST-factory helpers from `loadtest-scaffold.ts`. Generated files are self-contained — one scenario per file — and use `flow.batch()` + `api.async.*` for the parallel chain mode.

  Also bundles three side-effect fixes from the v2 rewrite that affect anyone who scaffolded a loadtest via `init()` / `create-k6` / k6-gen stubs:

  - `scaffoldLoadtest()` and `emit/loadtest-stub-template.ts` now emit `scenario:` (was the stale `pace:` from v1).
  - The shared AST helpers (`objLit` / `varConst` / `reExportConst` / `defaultExportProp`) moved to `scaffold/ast-helpers.ts` so the two scaffolders share one source.
  - `k6FrameworkImport()` and `authVarDecl()` exported so callers can compose their own scaffolders without duplicating logic.

  Adds `@clack/prompts` to runtime deps (used by the interactive wizard).

### Patch Changes

- Updated dependencies [a92f011]
  - @ahmedrowaihi/k6-gen@1.0.2

## 0.4.0

### Minor Changes

- b924e63: Add `k6-ts` CLI — drop-in replacement for `k6` from the terminal that bundles `.ts` entries on the fly.

  ```bash
  k6-ts run loadtest.ts --vus 50 --duration 1m
  k6-ts run loadtest.ts -e BASE_URL=https://staging.example.com --out json=results.json
  k6-ts archive loadtest.ts -O archive.tar
  k6-ts inspect loadtest.ts

  # Anything without a .ts entry passes straight through to k6
  k6-ts version
  k6-ts --help
  ```

  Behavior:

  - The rightmost positional arg ending in `.ts` (that exists on disk) is bundled with tsdown (`k6` / `k6/*` external) into `.k6-ts-cache/`; k6 is then spawned with that arg swapped for the bundled output.
  - `cwd` is preserved — runtime-relative paths in the script (`open("./fixtures/data.csv")` etc.) resolve against the directory you invoked `k6-ts` from.
  - SIGINT/SIGTERM/SIGHUP forwarded to the k6 child. Signal-killed runs return `128 + signum` per POSIX.
  - No `k6-ts`-specific flags — strict passthrough. Anything not a `.ts` entry goes through k6 unchanged.

  Also fixes a pre-existing bundling bug: `bundle()` now sets `noExternal: [/.*/]`, so consumer-side `dependencies` (notably `@ahmedrowaihi/k6`) are bundled in instead of being externalized by tsdown's library-mode default. This unbreaks both the new `k6-ts` CLI and the existing `runK6()` programmatic API.

### Patch Changes

- Updated dependencies [b924e63]
  - @ahmedrowaihi/k6-gen@1.0.1

## 0.3.0

### Minor Changes

- b17e354: Pass-through bump for `@ahmedrowaihi/k6` v2 + `@ahmedrowaihi/k6-gen` v2 — no API changes here, just propagating the new generated output (async namespace per op, widened CallOpts, runtime bridges) and the new framework shape (`scenario:` field name, async flow, `Ctx`, `flow.batch/group/check/sleep`, custom metrics, digest/ntlm).

### Patch Changes

- Updated dependencies [b17e354]
  - @ahmedrowaihi/k6-gen@1.0.0

## 0.2.1

### Patch Changes

- Updated dependencies [008fdf4]
  - @ahmedrowaihi/k6-gen@0.2.3

## 0.2.0

### Minor Changes

- 361d85f: New programmatic library for the k6 workflow. Exports `bundle()` (tsdown passthrough — every option reachable), `runK6()` (bundle + spawn k6 binary), `sync()` (drives `generate` + snapshot/diff), `init()` (one-shot scaffold: generates the typed client + AST-builds a starter `loadtest.ts` parameterized on `auth`/`pace`), plus a re-export of `generate` from `@ahmedrowaihi/k6-gen`. Replaces the deleted `@ahmedrowaihi/k6-tools` CLI — consumers drive the bundle/run/sync flow directly from their scripts. Bundler is tsdown.

### Patch Changes

- Updated dependencies [361d85f]
- Updated dependencies [361d85f]
  - @ahmedrowaihi/k6-gen@0.2.2
  - @ahmedrowaihi/openapi-tools@1.4.0
