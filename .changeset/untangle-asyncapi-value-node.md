---
"@ir-kit/asyncapi-typescript": patch
---

`TsStatementNode` and `RawTextNode` now share one `ValueNode` base instead of two copies of the codegen-core node boilerplate.
