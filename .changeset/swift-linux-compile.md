---
"@ir-kit/compiler-swift": minor
"@ir-kit/openapi-swift": minor
---

Generated Swift SDKs compile with SwiftPM on Linux and are swift-format-canonical on every real spec we test against (Stripe, OpenAI, DigitalOcean, Box, Slack, Spotify, Mux).

`@ir-kit/openapi-swift`:
- Files that use `URLSession`/`URLRequest`/`HTTPURLResponse` import `FoundationNetworking` under `#if canImport(FoundationNetworking)`; the import is derived from the declaration's AST.
- Free-form schema values are a generated `JSONValue` Codable enum instead of `Any`, so models containing them conform to `Codable`.
- Schemas that recursively contain themselves through stored properties become `final class` instead of `struct`.
- Swift keywords, leading digits and `self` in property, case and parameter names are escaped or renamed; schemas named after Swift/Foundation or runtime types (`Error`, `Data`, `URL`, `APIClient`, …) get a disambiguated name.
- `URLEncoding` is emitted whenever an API implementation is.

`@ir-kit/compiler-swift`:
- `ConditionalCompilation` blocks and `throws`/`async` on initializers.
- Line wrapping now matches swift-format for long type headers, stored properties, enum raw values, type aliases, assignments, array literals, nested calls, parameter defaults, function headers and tuple return types.
