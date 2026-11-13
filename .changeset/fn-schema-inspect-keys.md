---
"@ir-kit/fn-schema-core": patch
---

`runInspect` merges `identity`/`transport` flags with config the same way `runExtract` does, so `inspect` shows the schema `extract` writes: `""` or `"false"` turns a keyword off instead of being used as its name, and an unset keyword is off unless the config sets it.
