---
"@ir-kit/kit": patch
---

`ir spec convert` from `.proto` to OpenAPI now points every `$ref` at a schema it writes when the file has a `package` or imports Google's well-known types, and maps `google.protobuf.Timestamp` to a `date-time` string.
