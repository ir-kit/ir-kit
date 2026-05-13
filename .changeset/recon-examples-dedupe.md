---
"@ahmedrowaihi/openapi-recon": minor
---

Capture request/response examples and emit them on the OpenAPI media-type objects (`example` for single, named `examples` map for many). Hoist repeated object shapes into `components.schemas` and replace inline occurrences with `$ref`. Both behaviors are configurable via `maxExamples` and `refDedupeThreshold` on `createRecon`.
