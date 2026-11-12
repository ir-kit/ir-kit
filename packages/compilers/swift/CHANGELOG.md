# @ir-kit/compiler-swift

## 0.1.0

### Minor Changes

- 4146a79: `@ir-kit/openapi-swift` now builds `@ir-kit/compiler-swift` nodes directly: the plain-data `sw-dsl/` and the hand-written `sw-compiler` printer are deleted. The `sw*` builders in `src/ast` keep their names but return compiler nodes, and `SwDecl` is `{ kind, name, runtime?, node }`. Output now uses 2-space indentation (swift-format's default) with parameters inline. Unused builders (`swAs`, `swBinOp`, `swEq`, `swNe`, `swClosedRange`, `swDictLit`, `swForceUnwrap`, `swNil`, `swUnderscore`) are removed; `swCoalesce` is added.

  `@ir-kit/compiler-swift`: prints `leadingComments`; separates multi-line members of type bodies with a blank line and prints empty bodies as `{}`; escapes `\n`, `\r` and `\t` in string literals; wraps function and initializer parameters one per line past `maxLineLength` (default 100, matching swift-format); parenthesizes optional function types (`((A) -> B)?`); wraps long call arguments the way swift-format does; supports trailing closures on calls and labelled associated values on enum cases. More node types are exported on the `swift` namespace.

- 8f6e0f7: `@ir-kit/compiler-swift` wraps call arguments past `maxLineLength` the way swift-format does (break after `(`, pack arguments, close on its own line when they span several lines). `@ir-kit/openapi-swift` output is now swift-format-canonical: access modifiers sit on extension members instead of the extension, `Package.swift` uses 2-space indentation, and the multipart runtime appends `Data(text.utf8)` instead of an `if let` wrapper. CI lints the generated petstore Swift SDK.
- 746f3ad: Generated Swift SDKs compile with SwiftPM on Linux and are swift-format-canonical on every real spec we test against (Stripe, OpenAI, DigitalOcean, Box, Slack, Spotify, Mux).

  `@ir-kit/openapi-swift`:
  - Files that use `URLSession`/`URLRequest`/`HTTPURLResponse` import `FoundationNetworking` under `#if canImport(FoundationNetworking)`; the import is derived from the declaration's AST.
  - Free-form schema values are a generated `JSONValue` Codable enum instead of `Any`, so models containing them conform to `Codable`.
  - Schemas that recursively contain themselves through stored properties become `final class` instead of `struct`.
  - Swift keywords, leading digits and `self` in property, case and parameter names are escaped or renamed; schemas named after Swift/Foundation or runtime types (`Error`, `Data`, `URL`, `APIClient`, …) get a disambiguated name.
  - `URLEncoding` is emitted whenever an API implementation is.

  `@ir-kit/compiler-swift`:
  - `ConditionalCompilation` blocks and `throws`/`async` on initializers.
  - Line wrapping now matches swift-format for long type headers, stored properties, enum raw values, type aliases, assignments, array literals, nested calls, parameter defaults, function headers and tuple return types.
