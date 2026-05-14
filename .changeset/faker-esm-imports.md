---
"@ahmedrowaihi/openapi-ts-faker": patch
---

Add explicit `.js` extensions to internal relative imports so the published dist is consumable under strict Node ESM (e.g. direct CLI invocation), not only through bundler-aware loaders.
