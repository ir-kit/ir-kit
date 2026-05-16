---
"@ahmedrowaihi/create-k6": minor
---

New wizard scaffolder. Run `npm create @ahmedrowaihi/k6` to bootstrap a load-test project from an OpenAPI spec: pick spec path, output dir, auth flavor, optional per-op stubs — the wizard calls `@ahmedrowaihi/k6-toolkit`'s `init()` to emit the typed client and a starter `loadtest.ts`. Built on `@clack/prompts`.
