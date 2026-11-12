---
"@ir-kit/fn-schema-core": patch
---

`runExtract`, `runScan` and `runInspect` resolve their source files through one `listSourceFiles` helper, and an empty scan's stats now include `functionsFound: 0`.
