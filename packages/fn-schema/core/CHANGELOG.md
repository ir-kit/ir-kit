# @ir-kit/fn-schema-core

## 0.2.0

### Minor Changes

- f1fefb5: Consolidate fn-schema into the unified `ir` CLI. `@ir-kit/fn-schema-cli` is deleted; orchestration moved into `@ir-kit/fn-schema-core` as programmatic `runExtract()` / `runScan()` / `runInspect()` / `runDiff()`. New `ir fn-schema {extract,scan,inspect,diff}` commands wrap them.
