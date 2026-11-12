---
"@ir-kit/openapi-java": minor
---

New package: generate Java 17 client SDKs from OpenAPI 3.x. Models are records (string enums carry their wire value via `@JsonValue`), each tag gets a `<Tag>Api` interface with option-less `default` overloads and an `Http<Tag>Api` implementation on `java.net.http.HttpClient` + Jackson. The runtime ships as real `.java` sources. Optional `gradle: true` emits `build.gradle.kts`.
