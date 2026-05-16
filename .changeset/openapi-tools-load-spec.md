---
"@ahmedrowaihi/openapi-tools": minor
---

Add `loadSpec({ input, cwd, normalize })` — the single-source spec loader every generator now consumes. Handles path-vs-URL detection (relative paths resolved against `cwd`, URLs and absolute paths pass through), `$RefParser.bundle()`, and the optional safe-normalize pass. Also exports `resolveSpecInput()` for callers who only need the path/URL normalization. Promoted `@hey-api/json-schema-ref-parser` and `@ahmedrowaihi/openapi-core` to runtime deps so consumers get them transitively.
