---
"@ir-kit/openapi-loader": patch
"@ir-kit/openapi-typescript": patch
---

Keep unquoted YAML dates (such as Stripe's `api_version` enum) as strings instead of `Date` objects, which code generation dropped. The TypeScript target now loads specs with `@ir-kit/openapi-loader` like the native targets, so relative paths such as `specs/api.yaml` are no longer read as Hey API registry shorthands, external `$ref`s inside `x-` extensions are ignored, and specs that crashed Hey API's own loader (DigitalOcean) generate.
