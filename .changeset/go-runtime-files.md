---
"@ir-kit/openapi-go": minor
---

The Go SDK runtime (`api_client.go`, `auth.go`, `request_options.go`, …) now ships as real Go sources under `runtime/` and is copied into each generated SDK with only the package clause rewritten, instead of living as TypeScript template strings. The auth runtime is always included (no more spliced-in `Auth` field); `RuntimeOpts.hasAuth` and `apiClientGo` are removed.
