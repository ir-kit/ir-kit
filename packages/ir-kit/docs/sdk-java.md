# @ir-kit/kit/sdk/java

Generate a Java 17 client SDK from an OpenAPI 3.x spec.

- Models are `record`s; string enums carry their wire value via `@JsonValue`.
- One `<Tag>Api` interface per tag plus an `Http<Tag>Api` implementation.
- HTTP uses the JDK's `java.net.http.HttpClient`; JSON uses Jackson.
- The runtime (`ApiClient`, `RequestOptions`, `Auth`, …) ships as plain Java sources under `runtime/`.

```ts
import { generate } from "@ir-kit/kit/sdk/java";

await generate({
  input: "petstore.yaml",
  output: "sdk",
  packageName: "com.example.petstore",
  gradle: true,
});
```

```java
var client = new ApiClient(URI.create("https://petstore.example.com/v3"));
client.auth.put("api_key", new Auth.ApiKey("api_key", "secret", ApiKeyLocation.HEADER));
PetApi pets = new HttpPetApi(client);
Pet pet = pets.getPetById(1L);
```

Runtime dependencies: `com.fasterxml.jackson.core:jackson-databind` and `com.fasterxml.jackson.datatype:jackson-datatype-jsr310`.
