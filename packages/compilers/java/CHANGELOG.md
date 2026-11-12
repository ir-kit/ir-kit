# @ir-kit/compiler-java

## 0.1.0

### Minor Changes

- 3c8162e: Printer output now matches google-java-format: blank line after imports and between type members, one enum constant per line, and lines over `maxLineLength` (default 100) wrap at parameter lists, call arguments and after `=`.
- bfa139c: Add `createRecordDeclaration` (Java 16+ records): components print as annotated parameters, members go in the record body, empty records print as `{}`.
- 9e1e727: `compiler-java` supports `permits` on interface declarations and wraps long type headers, generic arguments, enum constants, comments and call chains the way google-java-format does. `openapi-java` emits integer enums as Java enums, returns a `sealed` interface for multi-status operations, and generates code that compiles and is google-java-format clean for large real-world specs (Stripe, OpenAI, Box, DigitalOcean, Slack, Mux).

### Patch Changes

- 31e4737: `loadOpenAPI` no longer fetches external `$ref`s inside `x-` vendor extensions. They are opaque data and are kept as `x-$ref`. Specs like Spotify's, whose `x-spotify-policy` points at a file that isn't shipped, now load. The new `detachExtensionRefs` helper is exported.

  Printers match their formatters on very long headers:
  - `compiler-kotlin` moves a return type that doesn't fit onto its own line and starts the expression body on the next line (ktlint `function-signature`).
  - `compiler-java` breaks before `implements` when a record's components still don't fit on the continuation line (google-java-format).
  - `compiler-go` prints an empty function body as `{\n}` once the header reaches 100 columns (gofmt).
