---
"@ir-kit/cli": minor
"@ir-kit/openapi-typescript": minor
---

`ir sdk <target>` commands — SDK generation for every target through one binary.

- `ir sdk go|kotlin|swift|typescript|k6` — schema-driven flags, each wraps the matching `@ir-kit/openapi-*` `generate()`.
- `ir sdk all --targets go,kotlin,...` — multi-target dispatch; one input, parallel outputs under `<output>/<target>/`.
- All `sdk` commands route input through `@ir-kit/spec-loader`, so `.tsp` files compile-on-the-fly via `@ir-kit/typespec-loader`. URL / file path / pre-parsed object all accepted.
- `@ir-kit/openapi-typescript`: widened `input` type to accept pre-parsed objects (matches the other emitters' shape).
