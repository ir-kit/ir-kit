---
"@ahmedrowaihi/openapi-ts-faker": patch
"@ahmedrowaihi/openapi-ts-orpc": patch
---

Widen `@faker-js/faker` peerDependency range to include v10 (`^10 || ^9 || ^8`). Matches the dev install and lets downstream consumers on faker v10 install without unmet-peer warnings.
