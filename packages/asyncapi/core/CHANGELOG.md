# @ir-kit/asyncapi-core

## 0.2.0

### Minor Changes

- 1c180ae: - `parseSpec` registers the Avro and OpenAPI schema parsers, so specs with `schemaFormat: application/vnd.apache.avro` or `application/vnd.oai.openapi` payloads no longer fail with "Unknown schema format".
