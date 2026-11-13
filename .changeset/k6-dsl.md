---
"@ir-kit/k6-gen": minor
"@ir-kit/k6-toolkit": minor
---

Build the client, types, data and loadtest scaffolds with Hey API's `$` DSL and renderer, and drop the `typescript` peer dependency. Generated files now use single quotes. `@ir-kit/k6-gen/ast` import helpers return `ModuleImport` objects for the new `printModule`, `printLoadtest` replaces `reExportConst`/`defaultExportProp`, and `Expr`/`TypeExpr` name the DSL value and type shapes.

Loadtest stub headers now keep multi-line operation summaries on one comment line; before, they broke out of the comment and the stub failed to parse.
