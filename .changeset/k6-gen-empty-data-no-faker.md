---
"@ahmedrowaihi/k6-gen": patch
---

Two cleanups for specs without any `components.schemas` (common with oRPC OpenAPI generators that inline every shape):

- Generated `data.ts` no longer emits the dead `import { faker } from "@faker-js/faker"` (or the type-namespace import) when there's nothing to build — was tripping no-unused-imports lint rules downstream.
- Generated `types.ts` now ends with `export {};` so tsc accepts it as a module — the umbrella `export * as types from "./types.js"` in `index.ts` was otherwise failing with "not a module" against the literally-empty file.
