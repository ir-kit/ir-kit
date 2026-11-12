---
"@ir-kit/openapi-go": minor
---

The plain-data Go DSL (`go-dsl/`) and the DSL→AST lowering are gone: emitters now build `@ir-kit/compiler-go` nodes directly through thin builders in `src/ast` (`goStruct`, `goFuncDecl`, `goCall`, …). `GoDecl` is now `{ kind, name, file?, receiver?, node }`, `goField` tags are passed without backticks, and `goFile` / `printFile` come from the printer module. Generated output is unchanged.
