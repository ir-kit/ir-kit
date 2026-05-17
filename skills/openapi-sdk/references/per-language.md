# Per-language options

Each native generator extends a shared `GenerateOptions` (input/output/clean/normalize) with a language-specific bundling flag.

## Go — `@ahmedrowaihi/openapi-go`

```ts
await generate({
  input: "./openapi.yaml",
  output: "./sdks/go",
  clean: true,
  normalize: true,

  // Optional: emit `go.mod` at the output root for standalone-module mode
  gomod: {
    module: "github.com/example/petstore-sdk",  // required
    goVersion: "1.22",                          // default
  },

  // Operations options
  defaultTag: "Pets",                           // tag used when an op has none
  interfaceName: (tag) => `${pascal(tag)}API`,  // override
  clientStructName: "Client",                   // default
  interfaceOnly: false,                         // emit only interfaces, no impl
  packageName: "api",                           // default
});
```

**Output shape**: idiomatic Go — operations return `(T, *http.Response, error)`. Auth and base URL flow through `Client`. No external deps (stdlib only). Drop into existing module by omitting `gomod`.

## Kotlin — `@ahmedrowaihi/openapi-kotlin`

```ts
await generate({
  input: "./openapi.yaml",
  output: "./sdks/kotlin",
  clean: true,
  normalize: true,

  // Optional: emit `build.gradle.kts` + `settings.gradle.kts`
  gradle: {
    artifact: "com.example.petstore",     // required; group + name
    group: "com.example",                 // optional override
    version: "1.0.0",                     // optional
    kotlinVersion: "2.0.21",              // default
    serializationVersion: "1.7.3",        // default
    okhttpVersion: "4.12.0",              // default
  },

  packageName: "com.example.petstore.api",
});
```

**Output shape**: `suspend` functions on a sealed `Client` interface. kotlinx-serialization for JSON, OkHttp for transport. Enums become `@Serializable enum class` with `@SerialName` for wire form.

## Swift — `@ahmedrowaihi/openapi-swift`

```ts
await generate({
  input: "./openapi.yaml",
  output: "./sdks/swift",
  clean: true,
  normalize: true,

  // Optional: emit `Package.swift` for a SwiftPM library
  package: {
    name: "PetstoreSDK",                  // required
    platforms: {
      iOS: "v16",                         // default v15
      macOS: null,                        // omit
      tvOS: "v16",
      watchOS: null,
    },
    toolsVersion: "5.9",                  // default
    sources: ["API", "Models"],           // default; matches layout
  },
});
```

**Output shape**: `async throws` functions on a `Client` struct. `Codable` types for request/response, `URLSession` for transport. Enums are raw-typed (`enum Status: String, Codable`).

## TypeScript — `@ahmedrowaihi/openapi-typescript`

```ts
await generate({
  input: "./openapi.yaml",
  output: "./sdks/ts",

  // Default plugins emit a runnable fetch-based client
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    "@hey-api/sdk",
  ],

  // Pass-through to hey-api's UserConfig
  heyApi: {
    parser: {
      transforms: {
        enums: "root",        // hoist inline enums to top-level
        readWrite: { mode: "split" },
      },
    },
  },

  normalize: true,           // optional; off by default for TS (hey-api owns normalization)
});
```

**Plugin ecosystem**: drop in any hey-api first-party plugin (`@tanstack/react-query`, `@hey-api/sdk-axios`, `@hey-api/transformers`, validators) or contract-kit's own (`@ahmedrowaihi/openapi-ts-faker`, `@ahmedrowaihi/openapi-ts-orpc`, `@ahmedrowaihi/openapi-ts-paths`, `@ahmedrowaihi/openapi-ts-typia`, `@ahmedrowaihi/openapi-ts-k6`).

**Plugin order matters**: client plugin first, then types, then SDK. Validators / mock factories come after.

## What's common

All four:
- Accept the same input shape (path / URL / object).
- Share the `loadSpec` loader from `@ahmedrowaihi/openapi-tools` (URL detection, `$RefParser.bundle`, optional `normalizeSpec`).
- Resolve `output` against the caller's CWD by default; pass `cwd:` to override.
- Default to `clean: true` (wipe output before writing). Pass `clean: false` to merge with existing files.
- Return `{ files: BuiltFile[], output: string }`.

## What's different

| Feature | Go | Kotlin | Swift | TypeScript |
|---|---|---|---|---|
| Manifest flag | `gomod` | `gradle` | `package` | n/a |
| Stdlib transport | net/http | OkHttp | URLSession | fetch (hey-api plugin) |
| Async style | `context.Context` | `suspend` | `async throws` | `Promise<T>` |
| Serialization | encoding/json | kotlinx-serialization | Codable | hey-api's typescript |
| Output structure | flat .go files | `src/main/kotlin/...` | `Sources/API`, `Sources/Models` | hey-api convention |
