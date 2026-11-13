# @ir-kit/openapi-recon

## 0.3.0

### Minor Changes

- 039b040: - Path templating works per segment, so integer, UUID (any version, including v7) and long hex segments become parameters even when seen once, as in `/pets/1` becoming `/pets/{petId}`.
  - One static path such as `/users/me` or an unrelated route of the same length no longer stops every sibling from being templated.

## 0.2.0

### Minor Changes

- be5f9e6: Consolidate scattered CLIs into the unified `ir` binary.
  - `ir recon <har>` — HAR → OpenAPI 3.1 reverse-engineering; replaces the standalone `openapi-recon` binary.
  - The `typespec-to-openapi` binary is removed; covered by `ir spec convert <main.tsp> --to openapi3`.
  - `@ir-kit/openapi-recon` and `@ir-kit/typespec-loader` no longer ship their own `bin` entries; they remain importable libraries.

  `@ir-kit/fn-schema-cli` and the `@ir-kit/k6-toolkit` CLI utilities are unchanged for now; they'll get their own migration commits since each has multiple subcommands worth porting carefully.
