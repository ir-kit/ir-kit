---
"@ir-kit/compiler-java": patch
"@ir-kit/openapi-java": patch
"@ir-kit/openapi-swift": patch
---

Export `java.BinaryOperator` and `java.Modifier` so the Java generator's AST helpers take typed operators and modifiers instead of casting strings, and narrow struct declarations by node kind in Swift's value-cycle boxing instead of casting.
