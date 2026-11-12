---
"@ir-kit/compiler-kotlin": minor
"@ir-kit/openapi-kotlin": minor
---

`@ir-kit/openapi-kotlin` now prints through `@ir-kit/compiler-kotlin`; the hand-written `kt-compiler` printer is deleted. Generated SDKs (models, APIs and runtime) are ktlint-canonical, and CI lints the petstore example and the runtime.

- The runtime (`APIClient.kt`, `Auth.kt`, …) ships as real Kotlin sources under `runtime/` with only the package header rewritten. Auth helpers are always included; `RuntimeOpts.hasAuth`, `hasFormUrlEncoded` and `apiClientKt` are removed.
- `@ir-kit/compiler-kotlin`: prints `leadingComments`, adds an `indentSize` option, implements `maxLineLength` (default 140, matching ktlint_official) by wrapping call arguments, single-parameter signatures and expression bodies, and separates annotated enum entries with a blank line.
