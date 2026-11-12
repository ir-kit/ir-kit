---
"@ir-kit/asyncapi-core": minor
---

- `parseSpec` registers the Avro and OpenAPI schema parsers, so specs with `schemaFormat: application/vnd.apache.avro` or `application/vnd.oai.openapi` payloads no longer fail with "Unknown schema format".
