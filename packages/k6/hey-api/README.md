# @ir-kit/openapi-ts-k6

Thin [`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts) plugin that wraps [`@ir-kit/k6-gen`](../gen). For users who already drive code generation through `openapi-ts.config.ts` — otherwise prefer the [`k6-tools` CLI](../tools).

```ts
// openapi-ts.config.ts
import { defineConfig } from "@hey-api/openapi-ts";
import { defineConfig as defineK6 } from "@ir-kit/openapi-ts-k6";

export default defineConfig({
  input: "./openapi.yaml",
  output: "./src/generated",
  plugins: [
    defineK6({ output: "./k6", defaultBaseUrl: "https://api.example.com" }),
  ],
});
```

Emits the same four files (`types.ts`, `client.ts`, `data.ts`, `index.ts`) under `<hey-api output.path>/<plugin output>` — see [@ir-kit/k6-gen](../gen) for output shape.

The plugin is a single function call: it reads the bundled spec from hey-api's context and delegates to `generate()`. No `$` DSL, no symbol planner, no plugin hooks — just spec → files.
