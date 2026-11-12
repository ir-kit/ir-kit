---
"@ir-kit/spec-convert": minor
"@ir-kit/openapi": minor
---

- `convertSpec` converts OpenAPI to proto3 directly, building a message or enum per component schema and a gRPC service per operation tag, with request messages from parameters and bodies and responses from the 2xx schemas.
- `SchemaToTypeOps` accepts an optional `multiUnion` hook so targets with a native sum type can build it instead of falling back to an untyped value.
