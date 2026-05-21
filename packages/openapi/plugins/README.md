# `@hey-api/openapi-ts` plugins

The four plugins in this directory layer onto [`@hey-api/openapi-ts`](https://heyapi.dev) to emit additional artifacts alongside the core types and clients. They version in lockstep (Changesets `fixed` config) — bumping one bumps all to the same version.

| Package | Emits |
| --- | --- |
| [`@ir-kit/openapi-ts-orpc`](./orpc) | Type-safe oRPC contracts (clients + servers) |
| [`@ir-kit/openapi-ts-faker`](./faker) | `@faker-js/faker` mock-data factories |
| [`@ir-kit/openapi-ts-typia`](./typia) | Compile-time `typia` Standard Schema validators |
| [`@ir-kit/openapi-ts-paths`](./paths) | Per-operation route consts for tree-shakable runtime routing |

Each plugin's README has install + usage details. Compose freely — they coexist in the same `plugins: […]` array and each writes to its own output file.
