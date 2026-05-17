---
"@ahmedrowaihi/k6-toolkit": minor
---

Add `k6-ts sync` subcommand — generate the typed k6 client from an OpenAPI spec without writing a `scripts/sync.mjs`. Closes the last shell-composability gap in the HAR → typed loadtest pipeline.

```bash
# File or URL
k6-ts sync ./openapi.yaml --output ./src/gen
k6-ts sync https://api.example.com/openapi.json --output ./src/gen

# Compose with openapi-recon (HAR → spec → typed client in one shell line)
openapi-recon ./traffic.har | k6-ts sync - --output ./src/gen

# All the programmatic sync() options surfaced as flags
k6-ts sync ./openapi.yaml --output ./src/gen --base-url https://staging.example.com
k6-ts sync ./openapi.yaml --output ./src/gen --scaffold        # emit per-op stubs
k6-ts sync ./openapi.yaml --output ./src/gen --report-renames  # CI rename diff
k6-ts sync ./openapi.yaml --output ./src/gen --dry-run
```

Flags: `--output` (default `./src/gen`), `--base-url`, `--scaffold`, `--no-normalize`, `--dry-run`, `--report-renames`, `--help`. Status messages on stderr; the spec input accepts `-` for stdin JSON so it pipes cleanly from `openapi-recon`. Wraps the existing `sync()` API verbatim — same behavior, no semantic divergence.

The full no-spec pipeline becomes four shell lines (or three if you skip the intermediate file):

```bash
openapi-recon ./traffic.har --out spec.json
k6-ts sync ./spec.json --output ./src/gen
k6-ts scaffold --spec ./spec.json --tags pets --output-dir loadtests/
K6_WEB_DASHBOARD=true k6-ts run loadtests/pets.ts
```
