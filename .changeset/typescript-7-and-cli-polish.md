---
"@ir-kit/cli": patch
"@ir-kit/create-k6": patch
"@ir-kit/k6-gen": patch
"@ir-kit/k6-toolkit": patch
"@ir-kit/asyncapi-typescript": patch
"@ir-kit/fn-schema-transformer": patch
"@ir-kit/fn-schema-typescript": patch
"@ir-kit/openapi-ts-faker": patch
"@ir-kit/openapi-ts-orpc": patch
"@ir-kit/openapi-ts-typia": patch
---

- `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
- `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
- `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
- k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.
