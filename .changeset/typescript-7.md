---
"@ir-kit/cli": patch
"@ir-kit/fn-schema-typescript": patch
"@ir-kit/openapi-ts-orpc": patch
---

Work with TypeScript 7 installed. `@ir-kit/cli` no longer installs TypeScript 5, `@ir-kit/fn-schema-typescript` no longer asks for `typescript <7` (ts-morph and ts-json-schema-generator bring their own compiler), and the oRPC plugin parses handler files with the compiler that ships with ts-morph.
