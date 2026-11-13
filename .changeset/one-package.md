---
"ir-kit": major
"@ir-kit/create-k6": patch
---

Every tool now ships in one package, `ir-kit`. Install it once and import what you need from a subpath:

- `ir-kit/spec`: load, convert, diff and document specs (was `@ir-kit/spec-*`, `openapi-loader`, `asyncapi-loader`, `typespec-loader`)
- `ir-kit/sdk/go`, `/java`, `/kotlin`, `/swift`, `/typescript`, `/k6`, `/asyncapi`: SDK generators (was `@ir-kit/openapi-<lang>`, `k6-gen`, `asyncapi-typescript`)
- `ir-kit/openapi-ts/faker`, `/orpc`, `/paths`, `/typia`, `/k6`: Hey API plugins (was `@ir-kit/openapi-ts-*`)
- `ir-kit/fn-schema` and `ir-kit/fn-schema/unplugin`: fn-schema (was `@ir-kit/fn-schema-*`)
- `ir-kit/recon`, `ir-kit/k6-toolkit`, `ir-kit/schema`, `ir-kit/codegen`
- the `ir` command comes with the package (was `@ir-kit/cli`)

Format libraries such as TypeSpec, the AsyncAPI parser, Postman converters, ts-morph and the plugin peers are optional. Install them only for the features that use them.

`@ir-kit/k6` stays its own package because it runs inside k6. The old package names get a last release that points to `ir-kit`.
