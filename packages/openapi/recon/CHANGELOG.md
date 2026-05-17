# @ahmedrowaihi/openapi-recon

## 1.3.0

### Minor Changes

- c63b969: Add `fromHAR()` + `openapi-recon` CLI — fold HAR files into OpenAPI 3.1 specs without hand-writing the observe-loop.

  **Programmatic** (`fromHAR(source, config?)`):

  ```ts
  import { readFile } from "node:fs/promises";
  import { fromHAR } from "@ahmedrowaihi/openapi-recon";

  const recon = await fromHAR(
    await readFile("./studio-recording.har", "utf8"),
    { title: "Captured API" }
  );
  const spec = recon.toOpenAPI();
  ```

  **CLI** (`openapi-recon` binary):

  ```bash
  # File → file
  openapi-recon ./traffic.har --out spec.json --title "My API"

  # File → stdout (pipe to yq for YAML)
  openapi-recon ./traffic.har | yq -P > spec.yaml

  # stdin
  cat traffic.har | openapi-recon -
  ```

  Flags: `--out`, `--title`, `--version`, `--origin`, `--max-examples`, `--no-path-templating`. Status messages go to stderr so stdout/`--out` stays clean for piping. Exit codes: 0 success, 1 internal error, 2 user error.

  Both APIs handle edge cases the hand-rolled loop typically missed:

  - HTTP/2 pseudo-headers (`:authority`, `:method`, etc.) — silently dropped (Fetch rejects them)
  - Empty `postData.text` on `GET`/`HEAD` — silently dropped (Fetch rejects bodies on those)
  - Malformed URLs and illegal header values — entry skipped, replay continues

  `fromHAR` accepts either pre-parsed `HarFile` objects or raw JSON strings — stays runtime-agnostic (browsers, Workers, Deno). The CLI is Node-only by definition.

  Exports the minimal HAR 1.2 shape (`HarFile` / `HarEntry` / `HarRequest` / `HarResponse` / `HarHeader` / `HarSource`) for consumers that want to type their HAR inputs.

  This makes HAR the universal capture seam — any tool that exports HAR (k6 Studio Recorder, browser DevTools, mitmproxy, Charles, Postman) feeds straight through `fromHAR()` (or the CLI) into the rest of the contract-kit toolchain.

## 1.2.0

### Minor Changes

- 24d70b6: Capture request/response examples and emit them on the OpenAPI media-type objects (`example` for single, named `examples` map for many). Hoist repeated object shapes into `components.schemas` and replace inline occurrences with `$ref`. Both behaviors are configurable via `maxExamples` and `refDedupeThreshold` on `createRecon`.

## 1.1.1

### Patch Changes

- 5401075: Renamed `@ahmedrowaihi/oas-core` to `@ahmedrowaihi/openapi-core`; merged `@ahmedrowaihi/aas-core` and `@ahmedrowaihi/asyncapi-tools` into a single `@ahmedrowaihi/asyncapi-core`. Repository layout regrouped under `packages/{shared,openapi,asyncapi}/*`; `asyncapi-typescript` split its internal `lib/` into `runtime/` and `ast/`.

## 1.1.0

### Minor Changes

- 6292ee6: Add `Recon.originStats()`, `toOpenAPI({ origin })`, and `clearOrigin(origin)` so consumers can produce one spec per backend and selectively drop origins. Also drop the `@hey-api/shared` peer dep (inlined the one helper used) — package now works in browsers without shims.

## 1.0.0

### Major Changes

- d8bef10: New package. Reverse-engineer an OpenAPI 3.1 spec from observed HTTP traffic. Runtime-agnostic — accepts standard `Request` + `Response`, works in browsers, Node, edge runtimes, service workers.

  Inference covers:

  - Path templating with an ID-like heuristic (only templates segments where varying values look like IDs — `/users/me` won't collapse with `/users/123`).
  - JSON Schema 2020-12 inference from samples; `required` is the intersection across observations; PATCH bodies skip `required` (partial-update semantics).
  - String format detection (`uuid`, `email`, `date-time`, `date`, `uri`, `ipv4`); integer format (`int32`/`int64`) by range.
  - Auth scheme detection (Bearer, Basic, API key) → `components.securitySchemes` + per-operation `security`. Sensitive headers redacted from samples.

  Output round-trips cleanly through `@ahmedrowaihi/openapi-tools/parse` + `matchRequest`.
