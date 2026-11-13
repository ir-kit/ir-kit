---
"@ir-kit/kit": patch
---

The AsyncAPI TypeScript output now imports its own files with `.js` extensions, so it runs under plain Node ESM after `tsc`.
