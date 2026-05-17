---
"@ahmedrowaihi/k6": patch
---

Move `@types/k6` from `dependencies` to `peerDependencies` (range widened to `>=1.7.0`).

Fixes a type-resolution clash for consumers on `@types/k6@2.x`: pinning `^1.7.0` as a runtime dep meant pnpm/npm refused to hoist the consumer's `2.x` choice, leaving the framework and the consumer's loadtest each resolving k6's nominal `CookieJar` / `Response` shapes against different package versions. `protected __brand` properties then made the types nominally incompatible.

Consumers now control the `@types/k6` version directly. The peer range accepts both `1.7.0+` and `2.x` — modern pnpm/npm auto-install peer deps.
