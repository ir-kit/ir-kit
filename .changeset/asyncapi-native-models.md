---
"ir-kit": minor
---

`ir sdk go|kotlin|swift|java|typescript`, `ir sdk all` and `ir generate` now accept an AsyncAPI file. Each message payload and named component schema becomes a model type, for example `UserAccountCreatedMessage`. The AsyncAPI TypeScript generator builds its types from the same schemas (`asyncapiSchemas` in `ir-kit/ir`).
