# ir-kit/ir

ir-kit's own model of an HTTP API. The Go, Kotlin, Swift, Java and k6 generators read it, so they don't depend on any parser's internal types.

```ts
import { type IR, parseOpenAPI } from "ir-kit/ir";

const model: IR.Model = parseOpenAPI(openApiDocument);
for (const [path, item] of Object.entries(model.paths ?? {})) {
  for (const op of Object.values(item)) {
    console.log(op.method, path, op.securitySchemes);
  }
}
```

| Export | Description |
| --- | --- |
| `parseOpenAPI(doc)` | Read an OpenAPI 2.0, 3.0 or 3.1 document (refs already bundled) into `IR.Model`. Each operation lists the security schemes it accepts in `securitySchemes`, taken from its own `security` or the document's. |
| `asyncapiSchemas(doc, messageSuffix?)` | An AsyncAPI document's component schemas plus one schema per message payload, as OpenAPI 3.1 schemas. |
| `asyncapiToOpenAPI(doc)` | The same schemas wrapped in an OpenAPI 3.1 document with no paths. This is how the SDK targets write models from an AsyncAPI file. |
| `IR` | The model types: `Model`, `Operation`, `Parameter`, `Body`, `Response`, `Schema` and so on. |

`parseOpenAPI` uses Hey API's OpenAPI parser to read the document.
