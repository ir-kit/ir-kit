# @ahmedrowaihi/k6-tools

CLI for the [@ahmedrowaihi/k6](../framework) framework. Scaffold load-test projects, regenerate the typed client when the spec changes, bundle + run against the real [k6](https://k6.io) binary.

```bash
npm i -D @ahmedrowaihi/k6-tools
```

## Commands

### `k6-tools init`

Scaffold a new load-test project:

```bash
k6-tools init --spec ./openapi.yaml --output ./src/gen --auth bearer
```

Writes `loadtest.ts`, `k6-tools.config.ts`, and runs the generator. Re-run with `--force` to overwrite.

### `k6-tools sync`

Regenerate the typed client + data builders from the spec. Run this any time `openapi.yaml` changes.

```bash
k6-tools sync                       # picks up k6-tools.config.{ts,js}
k6-tools sync --spec ./other.yaml
```

### `k6-tools run`

Bundle the loadtest entry with esbuild (k6 has no module resolution) and shell out to the real `k6` binary.

```bash
k6-tools run                                              # bundles + runs the default
k6-tools run --base-url https://staging.api.example.com   # override BASE_URL
k6-tools run --vus 5 --duration 30s                       # override the implicit default scenario
k6-tools run --k6-arg=--stage --k6-arg=1m:50,2m:50,30s:0  # pass-through to k6
```

CLI overrides (`--vus`, `--duration`, `--stage`) drive k6's implicit `default` scenario which dispatches to `lt.default` — the first named scenario (or the shorthand `flow`/`test`).

## Config

```ts
// k6-tools.config.ts
import { defineConfig } from "@ahmedrowaihi/k6-tools";

export default defineConfig({
  spec: "./openapi.yaml",
  output: "./src/gen",
  loadtest: "./loadtest.ts",
  defaultBaseUrl: "https://api.example.com",
});
```

Loaded by [c12](https://github.com/unjs/c12) — also accepts `.js`, `.mjs`, `.json`, and `package.json#k6-tools`.

## See also

- [@ahmedrowaihi/k6](../framework) — the runtime framework
- [@ahmedrowaihi/k6-gen](../gen) — generator used internally by `sync` / `init`
- [examples/k6-petstore](../../../examples/k6-petstore/) — full working setup
