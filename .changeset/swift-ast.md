---
"@ir-kit/compiler-swift": minor
"@ir-kit/openapi-swift": minor
---

`@ir-kit/openapi-swift` now builds `@ir-kit/compiler-swift` nodes directly: the plain-data `sw-dsl/` and the hand-written `sw-compiler` printer are deleted. The `sw*` builders in `src/ast` keep their names but return compiler nodes, and `SwDecl` is `{ kind, name, runtime?, node }`. Output now uses 2-space indentation (swift-format's default) with parameters inline. Unused builders (`swAs`, `swBinOp`, `swEq`, `swNe`, `swClosedRange`, `swDictLit`, `swForceUnwrap`, `swNil`, `swUnderscore`) are removed; `swCoalesce` is added.

`@ir-kit/compiler-swift`: prints `leadingComments`; separates multi-line members of type bodies with a blank line and prints empty bodies as `{}`; escapes `\n`, `\r` and `\t` in string literals; wraps function and initializer parameters one per line past `maxLineLength` (default 100, matching swift-format); parenthesizes optional function types (`((A) -> B)?`); wraps long call arguments the way swift-format does; supports trailing closures on calls and labelled associated values on enum cases. More node types are exported on the `swift` namespace.
