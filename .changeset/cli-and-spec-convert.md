---
"@ir-kit/cli": minor
"@ir-kit/spec-convert": minor
---

Two new packages establishing the unified API-toolkit surface.

- `@ir-kit/spec-convert`: convert between API spec formats (OpenAPI 3, AsyncAPI 3, TypeSpec, Protobuf, JSON Schema). Pair-handler registry; programmatic `convertSpec({ input, to, from? })` API. Seeded with `typespec → openapi3` and `openapi3 → json-schema`.
- `@ir-kit/cli`: single `ir` binary with a noun-verb command tree (gcloud / kubectl / aws-cli style). Each command is JSON-Schema-defined; the runtime auto-derives citty flags, `@clack/prompts` interactive prompts, help text, and validation from the schema. First command shipped: `ir spec convert`.
