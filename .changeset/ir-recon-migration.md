---
"@ir-kit/cli": minor
"@ir-kit/openapi-recon": minor
"@ir-kit/typespec-loader": minor
---

Consolidate scattered CLIs into the unified `ir` binary.

- `ir recon <har>` — HAR → OpenAPI 3.1 reverse-engineering; replaces the standalone `openapi-recon` binary.
- The `typespec-to-openapi` binary is removed; covered by `ir spec convert <main.tsp> --to openapi3`.
- `@ir-kit/openapi-recon` and `@ir-kit/typespec-loader` no longer ship their own `bin` entries; they remain importable libraries.

`@ir-kit/fn-schema-cli` and the `@ir-kit/k6-toolkit` CLI utilities are unchanged for now; they'll get their own migration commits since each has multiple subcommands worth porting carefully.
