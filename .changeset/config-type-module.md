---
"ir-kit": patch
---

`ir.config.ts` loads as an ES module without Node's reparse warning when `package.json` has no `"type": "module"`, as in a fresh `npm init` folder.
