---
"ir-kit": patch
---

`ir init` writes `ir.config.mts` when `package.json` isn't `"type": "module"`, so the config loads without errors or warnings after `npm init`.
