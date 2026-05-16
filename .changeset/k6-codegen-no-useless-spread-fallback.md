---
"@ahmedrowaihi/k6-gen": patch
---

Drop the redundant `|| {}` fallback from spread in generated `applyMiddlewareHeaders` calls. Spreading `undefined`/`null` into an object literal is already a no-op; the fallback only existed to silence type-checkers and now trips `no-useless-fallback-in-spread` in downstream oxc-eslint setups.
