---
"ir-kit": major
---

Add `ir.config.ts` and one command to regenerate everything from it:

- `ir init` writes a starter `ir.config.ts`. With the `k6` target it also writes a starter loadtest, replacing `npm create @ir-kit/k6`.
- `ir generate` runs every target in the config: `go`, `kotlin`, `swift`, `java`, `typescript`, `k6`, `docs` and `asyncapi`.
- `ir generate --check` writes nothing and fails when committed output is out of date. Use it in CI instead of the `sdk-regen` and `asyncapi-regen` GitHub Actions, which are removed.
- `ir watch` regenerates when the spec or config changes.
- `defineConfig` comes from `ir-kit`, and `generate`, `loadIrConfig` and `watch` from `ir-kit/generate`.

`@ir-kit/create-k6` is no longer published.
