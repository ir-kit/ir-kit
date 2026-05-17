---
"@ahmedrowaihi/k6-gen": patch
---

`WalkedOperation` now exposes the OpenAPI `tags: ReadonlyArray<string>` on each yielded op. Pre-existing callers see no behavior change — the field is additive. Consumed by `@ahmedrowaihi/k6-toolkit`'s scaffolder to group ops by tag for the `--tags` batch mode.
