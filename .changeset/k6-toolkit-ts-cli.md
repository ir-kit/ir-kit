---
"@ahmedrowaihi/k6-toolkit": minor
---

Add `k6-ts` CLI — drop-in replacement for `k6` from the terminal that bundles `.ts` entries on the fly.

```bash
k6-ts run loadtest.ts --vus 50 --duration 1m
k6-ts run loadtest.ts -e BASE_URL=https://staging.example.com --out json=results.json
k6-ts archive loadtest.ts -O archive.tar
k6-ts inspect loadtest.ts

# Anything without a .ts entry passes straight through to k6
k6-ts version
k6-ts --help
```

Behavior:
- The rightmost positional arg ending in `.ts` (that exists on disk) is bundled with tsdown (`k6` / `k6/*` external) into `.k6-ts-cache/`; k6 is then spawned with that arg swapped for the bundled output.
- `cwd` is preserved — runtime-relative paths in the script (`open("./fixtures/data.csv")` etc.) resolve against the directory you invoked `k6-ts` from.
- SIGINT/SIGTERM/SIGHUP forwarded to the k6 child. Signal-killed runs return `128 + signum` per POSIX.
- No `k6-ts`-specific flags — strict passthrough. Anything not a `.ts` entry goes through k6 unchanged.

Also fixes a pre-existing bundling bug: `bundle()` now sets `noExternal: [/.*/]`, so consumer-side `dependencies` (notably `@ahmedrowaihi/k6`) are bundled in instead of being externalized by tsdown's library-mode default. This unbreaks both the new `k6-ts` CLI and the existing `runK6()` programmatic API.
