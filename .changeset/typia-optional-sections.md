---
"@ir-kit/openapi-ts-typia": patch
---

Validate optional request sections. An operation with an optional `body`, `query` or `headers` (for example `body?: Blob | File`) got `unknown` for that section, so its validator accepted anything. Optional sections now keep their type and also accept `undefined`.
