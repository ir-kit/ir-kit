---
"@ir-kit/openapi-kotlin": minor
---

Generated Kotlin SDKs compile with `kotlinc` and the kotlinx.serialization plugin on every real spec we test against (Stripe, OpenAI, DigitalOcean, Box, Slack, Spotify, Mux). CI now compiles the generated petstore SDK.

- Free-form schema values (`{}`, untyped `additionalProperties`, unresolvable unions) are `JsonElement` instead of `Any`, so models containing them are serializable. Callers that passed arbitrary objects now build a `JsonElement`.
- `@SerialName` and enum raw values are emitted as Kotlin string literals, so keys containing `$` stay compile-time constants.
- Serializers are resolved through type aliases (`typealias Window = Window2?` encodes with `Window2.serializer().nullable`, list and map aliases use `ListSerializer`/`MapSerializer`).
- Schemas named after Kotlin, library or runtime types (`Response`, `Request`, `Result`, `APIClient`, …) get a disambiguated name.
- Operation parameters that would shadow a local of the generated method body (`options`, `url`, `client`, …) get a `Param` suffix.
- Requests set their HTTP method once: with the body when the operation has one, otherwise up front with an empty body for `POST`/`PUT`/`PATCH`. Previously every request started as `.method("POST", null)`, which OkHttp rejects at runtime.
