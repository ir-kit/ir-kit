---
"@ir-kit/spec-convert": minor
---

Three new converters and a graph-routed dispatcher.

- `proto → openapi3` via pure-JS `protobufjs` (no Go binary).
- `postman → openapi3` via `@readme/postman-to-openapi`.
- `openapi3 → postman` via the Postman-official `openapi-to-postmanv2`.
- `convertSpec` now BFS-routes through registered edges when no direct `(from → to)` pair exists, so `postman → typespec` and `proto → postman` resolve automatically through OpenAPI 3 as the hub.
