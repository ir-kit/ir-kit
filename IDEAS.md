# Ideas

Loose roadmap. Not a commitment — order shifts with whatever's actually useful.

ir-kit's thesis: **every API standard talks to every other**. One canonical hub (OpenAPI 3), N input loaders, M output emitters — adding any new format becomes N+M handlers instead of N×M.

## Shipped

### Federation core

- **`@ir-kit/spec-loader`** — universal loader; detects OpenAPI 3 / AsyncAPI 3 / TypeSpec by extension + content sniff, returns `{ kind, document }`.
- **`@ir-kit/openapi-loader`**, **`@ir-kit/asyncapi-loader`**, **`@ir-kit/typespec-loader`** — per-format loaders the universal loader delegates to.
- **`@ir-kit/spec-convert`** — graph-routed converter dispatcher. BFS over registered edges, source-stage intermediates bridged via temp file. Registered edges today: `openapi3 ↔ typespec`, `openapi3 → json-schema`, `openapi3 → postman`, `postman → openapi3`, `proto → openapi3`, `typespec → proto`. Every other pair (e.g. `postman → typespec`, `proto → json-schema`) resolves automatically through OpenAPI 3 as the hub.
- **`@ir-kit/spec-docs`** — render any input as standalone HTML via Scalar API Reference (`@scalar/core/libs/html-rendering`).
- **`@ir-kit/spec-diff`** — cross-family diff via `api-smart-diff`; breaking / non-breaking / annotation / unclassified / deprecated classification.
- **`@ir-kit/cli`** — unified `ir` CLI. Schema-driven commands; auto-derived flags, prompts, help, validation. Every legacy per-package CLI has been deleted in favor of subcommands here.
- **`@ir-kit/schema`** — canonical JSON Schema 2020-12 IR. Source-agnostic schema model + adapters from hey-api IR and AsyncAPI parser schemas.

### Native SDK targets

- **`@ir-kit/openapi-go`** — Go SDK generator: stdlib-only (`net/http` + `encoding/json` + `mime/multipart`), `context.Context`-first signatures, generics `Execute[T]`, per-tag interfaces with `*WithResponse` companions, sealed-style sum types via marker interface + concrete cases for multi-2xx ops.
- **`@ir-kit/openapi-kotlin`** — Android / JVM Kotlin SDK generator: OkHttp + kotlinx-serialization + suspend, with multipart/form/binary body support, per-call options, composable interceptors, typed errors, multi-2xx sum-type returns, and per-op security auto-wiring.
- **`@ir-kit/openapi-swift`** — iOS Swift SDK generator: protocols + `Codable` structs + URLSession-backed async-throws impls. Same feature surface as `openapi-kotlin`.
- **`@ir-kit/openapi-typescript`** — programmatic wrapper around `@hey-api/openapi-ts` matching the `(spec, output) → files` shape of the other native SDKs.

### Hey-api plugins

- **`@ir-kit/openapi-ts-orpc`** — emit oRPC contracts from OpenAPI.
- **`@ir-kit/openapi-ts-faker`** — emit `@faker-js/faker` mock factories from schemas.
- **`@ir-kit/openapi-ts-typia`** — emit typia validators.
- **`@ir-kit/openapi-ts-paths`** — emit per-operation route consts.

### k6 track

- **`@ir-kit/k6`** — author k6 load tests in TypeScript: `defineLoadTest`, `flow().step()` chaining, pace presets, budgets, auth middleware.
- **`@ir-kit/k6-gen`** — OpenAPI spec → typed k6 client (one function per operation), TS types, faker-backed data builders.
- **`@ir-kit/k6-toolkit`** — bundle, run, sync flow. `ir k6 sync` / `ir k6 bundle` are the CLI entry points.
- **`@ir-kit/create-k6`** — wizard scaffolder.

### AsyncAPI track

- **`@ir-kit/asyncapi-typescript`** — AsyncAPI 3.0 → TypeScript. Plugin-compose architecture; parser via `@asyncapi/parser`, JSON Schema → TS via `@asyncapi/modelina`.
- **`@ir-kit/asyncapi-core`** — shared AsyncAPI primitives. AMQP binding extractors, routing-key matching.

### Reverse engineering

- **`@ir-kit/openapi-recon`** — reverse-engineer OpenAPI 3.1 from observed HTTP. Runtime-agnostic; standard `Request` / `Response`. CLI subcommand: `ir recon`.
- **`@ir-kit/glean`** — DevTools extension wrapping `openapi-recon`.

### fn-schema track

- **`@ir-kit/fn-schema-core`**, **`@ir-kit/fn-schema-loader`**, **`@ir-kit/fn-schema-transformer`**, **`@ir-kit/fn-schema-typescript`**, **`@ir-kit/fn-schema-unplugin`** — extract JSON Schema from TS function signatures. Programmatic API in `*-core`; `ir fn-schema {scan,extract,inspect,diff}` are the CLI entry points.

### Tools

- **`@ir-kit/openapi-tools`** — runtime helpers (`/match`, `/parse`, `/diff`, `/ir`, `/router`, `/merge`).
- **`actions/sdk-regen`** GitHub Action — regenerates Go / Kotlin / Swift SDKs on dispatch / push.
- **`ir-kit-mux-demo`** repo — multi-language Mux SDK demo consuming the action.

## Planned

### Format coverage

- **GraphQL** — never integrated. Add `graphql → openapi3` (and ideally back) to bring GraphQL into the federation. Candidate libs: `graphql-to-openapi`, IBM `openapi-to-graphql` (reverse).
- **`openapi3 → proto` (direct)** — currently blocked because the TypeSpec → Protobuf hop loses `@field` numbers + `@TypeSpec.Protobuf.package` decorators. Either build a direct OpenAPI → proto generator, or invest in a decorator-injection pass over the intermediate TypeSpec.
- **`asyncapi3 → openapi3` (and back)** — bring AsyncAPI into the converter graph. Today it loads via `spec-loader` but isn't a `spec-convert` source or target.
- **Postman v2.0** — only v2.1 is wired through `@readme/postman-to-openapi`; older collections may need a pre-conversion pass.

### Validation + linting

- **`ir spec validate <spec>`** — wraps `spec-loader`'s existing parser with rich error reporting + CI-friendly exit codes.
- **`ir spec lint <spec>`** — integrate Spectral or Redocly CLI; surface style/quality rules across every supported source format.

### Diff polish

- **HTML / markdown diff output** — currently the `ir spec diff` text output is the only renderer; add HTML (Scalar-style) and markdown reports for PR comments.
- **Native AsyncAPI 2.x diff** — `api-smart-diff` supports it directly; bypass the openapi3 normalization for asyncapi-to-asyncapi diffs when both inputs are already that format.

### AsyncAPI parity

- **Multi-target AsyncAPI generators** to match OpenAPI's breadth. Per `project_asyncapi_track_maturity.md`: the AsyncAPI track needs IR + per-language DSL/compiler/project layers to reach parity. Queued.
- **AsyncAPI broker-binding plugins** — separate emitters for AMQP / Kafka / NATS sitting on top of the message-first root model (per `project_asyncapi_root_model.md`).

### CI / quality

- **Cross-format converter test matrix** — verify every (from, to) reachable pair end-to-end on each PR. Catches regressions in graph routing or upstream converter library updates.
- **Real-world spec sweep** — Stripe, GitHub, OpenAI, Slack against all SDK generators in CI. Mux alone surfaced 2 bugs; wider sweep catches the long tail.

### Docs polish

- **`ir docs --serve`** — local HTTP server for live preview, complementing the static HTML emit.
- **Custom themes / branding** for `spec-docs` HTML output.

## Considered, declined

- **`openapi-drift`** — was queued (compare committed spec vs runtime-observed via recon). Declined because `@ir-kit/openapi-tools/diff` + `@ir-kit/spec-diff` cover the comparison; the wrapper would mostly be plumbing. Revisit only if there's clear demand for the CI ergonomics.
- **API gateway / aggregator** — crowded space (Kong, Apollo Federation, tRPC). No clear differentiation without going much bigger than this monorepo's scope.
- **Spec registry / hosted SaaS** — out of scope; needs infra and ongoing ops.
- **Generic API testing** — surface too broad; many existing tools.

## Maintenance / cross-cutting

- **SDK contract IR.** Heavier refactor: an intermediate AST between hey-api's IR and per-language DSLs, capturing tag → interface, op signatures with abstract types, body strategy, multi-2xx shape. Held off on after the `openapi/ir` extraction landed — the structurally-identical `schemasToDecls` and per-tag orchestration loop turned out to be too tightly coupled to per-language Decl types to share without a heavier abstraction. Revisit if a fourth language target ships and the duplication cost outweighs the abstraction cost.
- **Federation IR proper.** Today OpenAPI 3 is the de-facto hub. Long-term, a richer IR (TypeSpec-style or fully custom) would model gRPC streaming, AsyncAPI messaging, and GraphQL more cleanly than OpenAPI does. Defer until a use case pushes against OpenAPI 3's expressivity limits.

## Glean polish (incremental)

- Request/response examples surfaced through Scalar (recon → emit `examples`).
- Enum detection (low-cardinality string fields) + `$ref` deduplication for shared object shapes.
- Smarter prefix detection so `/api/v1/episodes` and `/api/v1/users` share a `servers[]` prefix.
- Multi-tab capture (one panel state per inspected page is the current limit).
