---
"@ir-kit/compiler-kotlin": patch
"@ir-kit/openapi-kotlin": minor
---

The plain-data Kotlin DSL (`kt-dsl/`) is gone: the `kt*` builders in `src/ast` now return `@ir-kit/compiler-kotlin` nodes directly, and `KtDecl` is `{ kind, name, runtime?, receiver?, node }`. Imports are collected from the AST (`referencedNames` + `importsFor`) instead of regex-scanning printed source, so string literals and KDoc no longer trigger spurious imports. `ktProp`'s `inPrimary` is removed (data/enum/impl class properties always live in the primary constructor), as are the unused `ktTypeParam`, `ktClassRef`, `ktMapLit`, `ktRange`/`ktUntil` and `ktUnderscore`. `@ir-kit/compiler-kotlin` exports more node types on the `kt` namespace.
