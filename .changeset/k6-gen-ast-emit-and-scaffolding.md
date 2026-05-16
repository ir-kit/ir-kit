---
"@ahmedrowaihi/k6-gen": minor
---

Emit the client entirely through TypeScript AST (`ts.factory` + `$` DSL) — no template strings. Runtime helpers move to `@ahmedrowaihi/k6/runtime` so generated files stay small. Types now arrive via `import type * as T from "./types.js"` with `T.Pet`-style references. Add `scaffold` option (`true` or `{ dir, clientImport }`) that emits one `loadtests/<op>.ts` skeleton per operation; pre-existing stubs are never overwritten. `generate()` now returns the parsed `ir` so downstream tools can run secondary passes.
