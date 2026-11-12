---
"@ir-kit/compiler-kotlin": patch
"@ir-kit/openapi-kotlin": patch
---

Print `${name}` instead of `$name` when the following template text would extend the identifier, and make `createNullableType` return an already nullable type unchanged, so generators no longer guard either case themselves.
