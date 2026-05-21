---
"@ir-kit/fn-schema-core": minor
"@ir-kit/cli": minor
---

Consolidate fn-schema into the unified `ir` CLI. `@ir-kit/fn-schema-cli` is deleted; orchestration moved into `@ir-kit/fn-schema-core` as programmatic `runExtract()` / `runScan()` / `runInspect()` / `runDiff()`. New `ir fn-schema {extract,scan,inspect,diff}` commands wrap them.
