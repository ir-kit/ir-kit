---
"@ir-kit/spec-convert": minor
"@ir-kit/cli": minor
---

Bidirectional TypeSpec ↔ OpenAPI 3 conversion.

- New converter: `openapi3 → typespec` via `@typespec/openapi3`'s `convertOpenAPI3Document()` programmatic API. Returns TypeSpec source as a string.
- `ConvertOutput` is now a discriminated union: `{ kind: "document", document }` or `{ kind: "source", source, ext }`. Lets converters return either parsed objects (for JSON-based targets) or raw source (for TypeSpec, Proto, etc.).
- `ir spec convert` updated to pipe source output verbatim (no JSON serialization for `.tsp` / `.proto` targets).
