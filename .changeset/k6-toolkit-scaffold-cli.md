---
"@ahmedrowaihi/k6-toolkit": minor
---

Add `k6-ts scaffold` — interactive + flag-driven scenario generator.

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
