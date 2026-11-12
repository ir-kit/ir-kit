---
"@ir-kit/typespec-loader": patch
---

`compileTypespec` and `compileTypespecCapture` share one compile step for writing inline source, checking diagnostics and cleaning up, instead of two copies.
