---
"@ahmedrowaihi/k6-gen": patch
---

Move `typescript` from `dependencies` to `peerDependencies` (range `>=5.0.0`).

Eliminates the duplicate `typescript` install in consumer projects (one nested under k6-gen, one at the root) and lets `tsc` invocations from `k6-gen` use the consumer's compiler version. Aligns with the convention every TS codegen tool in the ecosystem uses.
