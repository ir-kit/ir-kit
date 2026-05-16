---
"@ahmedrowaihi/k6-toolkit": minor
---

New programmatic library that `@ahmedrowaihi/k6-tools` is built on. Exports `bundle()` (tsdown passthrough — every option reachable), `runK6()` (bundle + spawn k6 binary), `sync()` (drives `generate` + snapshot/diff), `spawnK6()`, `buildK6Args()`, `resolveTargets()`, plus a re-export of `generate` and the operation-id map/diff helpers. Consumers can now drive bundle + run + sync flows from their own scripts without shelling out to the CLI.
