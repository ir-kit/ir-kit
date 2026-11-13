---
"@ir-kit/cli": patch
---

`ir sdk all` now loads the spec once and gives the loaded document to every target, so `.tsp` input works for the `typescript` and `k6` targets too (they used to get the raw path and fail). All `ir sdk <target>` commands now come from one target table.
