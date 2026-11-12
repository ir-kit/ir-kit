---
"@ir-kit/openapi-loader": minor
"@ir-kit/compiler-go": patch
"@ir-kit/compiler-java": patch
"@ir-kit/compiler-kotlin": patch
---

`loadOpenAPI` no longer fetches external `$ref`s inside `x-` vendor extensions. They are opaque data and are kept as `x-$ref`. Specs like Spotify's, whose `x-spotify-policy` points at a file that isn't shipped, now load. The new `detachExtensionRefs` helper is exported.

Printers match their formatters on very long headers:
- `compiler-kotlin` moves a return type that doesn't fit onto its own line and starts the expression body on the next line (ktlint `function-signature`).
- `compiler-java` breaks before `implements` when a record's components still don't fit on the continuation line (google-java-format).
- `compiler-go` prints an empty function body as `{\n}` once the header reaches 100 columns (gofmt).
