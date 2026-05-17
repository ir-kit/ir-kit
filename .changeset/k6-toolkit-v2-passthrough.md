---
"@ahmedrowaihi/k6-toolkit": minor
"@ahmedrowaihi/create-k6": minor
"@ahmedrowaihi/openapi-ts-k6": minor
---

Pass-through bump for `@ahmedrowaihi/k6` v2 + `@ahmedrowaihi/k6-gen` v2 — no API changes here, just propagating the new generated output (async namespace per op, widened CallOpts, runtime bridges) and the new framework shape (`scenario:` field name, async flow, `Ctx`, `flow.batch/group/check/sleep`, custom metrics, digest/ntlm).
