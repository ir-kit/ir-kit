---
"@ir-kit/openapi-recon": minor
---

- Path templating works per segment, so integer, UUID (any version, including v7) and long hex segments become parameters even when seen once, as in `/pets/1` becoming `/pets/{petId}`.
- One static path such as `/users/me` or an unrelated route of the same length no longer stops every sibling from being templated.
