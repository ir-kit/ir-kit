---
"@ir-kit/asyncapi-typescript": major
---

`plugin.emitTs(path, nodes, options)` now takes Hey API `$` DSL nodes (`import { $ } from "@hey-api/openapi-ts"`) instead of `ts.Statement`s, or plain strings of TypeScript code for things the DSL can't build. Re-exports go through the new `options.exports`. The `typescript` peer dependency is gone. `EventMap` is now emitted as a `type` alias, and generated strings use single quotes.
