# @ir-kit/fn-schema-core

## 0.2.1

### Patch Changes

- 41c770f: `runExtract`, `runScan` and `runInspect` resolve their source files through one `listSourceFiles` helper, and an empty scan's stats now include `functionsFound: 0`.

## 0.2.0

### Minor Changes

- f1fefb5: Consolidate fn-schema into the unified `ir` CLI. `@ir-kit/fn-schema-cli` is deleted; orchestration moved into `@ir-kit/fn-schema-core` as programmatic `runExtract()` / `runScan()` / `runInspect()` / `runDiff()`. New `ir fn-schema {extract,scan,inspect,diff}` commands wrap them.
