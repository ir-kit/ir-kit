# `@ir-kit/k6-toolkit`

Programmatic toolkit for k6 workflows. One library covering the **bundle → run → sync** flow: bundle TypeScript loadtests (tsdown passthrough), spawn the k6 binary, sync the typed client from an OpenAPI spec.

## Install

```sh
npm install -D @ir-kit/k6-toolkit
```

## API

### `bundle(opts)`

Bundles a `.ts` / `.tsx` loadtest into the single ES module k6 expects.

```ts
import { bundle } from "@ir-kit/k6-toolkit";

await bundle({ entry: "loadtests/smoke.ts", out: ".k6/smoke.js" });
```

### `runK6(opts)`

Spawns the k6 binary with sensible defaults + structured output.

```ts
import { runK6 } from "@ir-kit/k6-toolkit";

await runK6({ entry: ".k6/smoke.js", env: { BASE_URL: "https://api.example.com" } });
```

### `sync(opts)`

Regenerates the typed client from an OpenAPI spec — same logic as the standalone `@ir-kit/k6-gen` package, surfaced for in-process invocation.

```ts
import { sync } from "@ir-kit/k6-toolkit";

await sync({ spec: "./openapi.yaml", output: "./src/gen" });
```

## CLI

The package also ships a `k6-ts` command for shell-driven workflows:

```sh
k6-ts bundle loadtests/smoke.ts --out .k6/smoke.js
k6-ts run .k6/smoke.js
k6-ts sync ./openapi.yaml --output ./src/gen
k6-ts scaffold --spec ./openapi.yaml --tags pets --output-dir loadtests/
```

`k6-ts sync` also accepts `-` to read the spec from stdin, so it composes cleanly with [`@ir-kit/openapi-recon`](https://github.com/ir-kit/ir-kit/tree/main/packages/openapi/recon) (HAR → spec) and similar pipes.

## Status

`0.1.0` — first release under the `@ir-kit/*` scope. Replaces the legacy `@ahmedrowaihi/k6-toolkit` (deprecated).

## Repo

Source at [ir-kit/ir-kit](https://github.com/ir-kit/ir-kit/tree/main/packages/k6/toolkit).
