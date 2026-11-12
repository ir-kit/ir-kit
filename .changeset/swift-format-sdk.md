---
"@ir-kit/compiler-swift": minor
"@ir-kit/openapi-swift": patch
---

`@ir-kit/compiler-swift` wraps call arguments past `maxLineLength` the way swift-format does (break after `(`, pack arguments, close on its own line when they span several lines). `@ir-kit/openapi-swift` output is now swift-format-canonical: access modifiers sit on extension members instead of the extension, `Package.swift` uses 2-space indentation, and the multipart runtime appends `Data(text.utf8)` instead of an `if let` wrapper. CI lints the generated petstore Swift SDK.
