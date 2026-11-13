---
"@ir-kit/openapi-ts-typia": major
---

`typiaTypeTransformer` now emits `tags.Format<'uuid'>` with an `import type { tags } from 'typia'` instead of inline `import("typia").tags.Format<"uuid">` types, and the `typescript` peer dependency is gone.
