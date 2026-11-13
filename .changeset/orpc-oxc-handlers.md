---
"@ir-kit/openapi-ts-orpc": patch
---

Handler files are now built with Hey API's TypeScript DSL and existing ones are read with `oxc-parser`, so the plugin no longer installs ts-morph and its copy of TypeScript. New handler files use single quotes and 2-space indentation like the rest of the generated code. When adding handlers to an existing file, a missing comma after the last handler is now added instead of producing a syntax error.
