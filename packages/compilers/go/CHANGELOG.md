# @ir-kit/compiler-go

## 0.1.0

### Minor Changes

- 0aa2094: Add `createTypeExpression` to the Go and Swift compilers and `createImplicitMemberExpression` to Swift, so generators place types in expression position without casting type nodes or printing them into identifier text.

### Patch Changes

- 0aa2094: Type try-with-resources declarations as `JavaTryResource` and make the Go and Java printers fail to compile when a node kind has no case.

## 0.0.1

### Patch Changes

- 31e4737: `loadOpenAPI` no longer fetches external `$ref`s inside `x-` vendor extensions. They are opaque data and are kept as `x-$ref`. Specs like Spotify's, whose `x-spotify-policy` points at a file that isn't shipped, now load. The new `detachExtensionRefs` helper is exported.

  Printers match their formatters on very long headers:
  - `compiler-kotlin` moves a return type that doesn't fit onto its own line and starts the expression body on the next line (ktlint `function-signature`).
  - `compiler-java` breaks before `implements` when a record's components still don't fit on the continuation line (google-java-format).
  - `compiler-go` prints an empty function body as `{\n}` once the header reaches 100 columns (gofmt).
