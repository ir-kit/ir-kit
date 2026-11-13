---
"ir-kit": patch
---

`ir init` writes `ir.config.mts` when `package.json` isn't `"type": "module"` (as after `npm init`), so the config loads as an ES module without errors or warnings. CommonJS configs are now read again after they change, so `ir watch` picks up edits.
