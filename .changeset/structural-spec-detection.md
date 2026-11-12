---
"@ir-kit/spec-loader": minor
"@ir-kit/spec-convert": minor
"@ir-kit/openapi-loader": minor
---

- Spec detection parses the document and reads its root `openapi`, `swagger` or `asyncapi` field instead of regex-scanning the first 2 KB, and rejects files that are none of these instead of treating them as OpenAPI.
- `spec-loader` exports `classifySpecDocument()` and `readSpecDocument()`, and `openapi-loader` exports `readSpecDocument()`.
- `convertSpec` detects Postman collections by content rather than only by the `.postman_collection.json` file name.
- `convertSpec` no longer routes OpenAPI to proto through generated TypeSpec, which always failed to compile, and reports that no converter path exists instead.
