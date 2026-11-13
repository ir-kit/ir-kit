# `ir generate`

List the spec and everything you want from it in one `ir.config.ts`, then run one command.

```ts
// ir.config.ts
import { defineConfig } from "ir-kit";

export default defineConfig({
  input: "api/openapi.yaml",
  targets: {
    go: { output: "sdk/go", gomod: "github.com/me/api-go" },
    kotlin: { output: "sdk/kotlin", gradle: true },
    typescript: { output: "sdk/ts" },
    k6: { output: "loadtest/client" },
    docs: { output: "docs/index.html" },
  },
});
```

```sh
npx ir-kit init       # write a starter ir.config.ts
npx ir generate       # write every target
npx ir generate --check   # write nothing; fail if any target is out of date
npx ir watch          # regenerate when the spec or config changes
```

`ir init` writes `ir.config.mts` instead when `package.json` isn't `"type": "module"`, so Node loads it as an ES module either way. `ir.config.{ts,mts,js,mjs}` are all found. `--targets go,docs` runs only some targets. `--config path/to/ir.config.ts` picks another file. Relative paths in the config start at the config file's directory.

## Targets

| Target | Options besides `output` and `input` |
| --- | --- |
| `go` | `packageName`, `gomod`, `clean`, `normalize`, `defaultTag` |
| `kotlin`, `java` | `packageName`, `gradle`, `clean`, `normalize`, `defaultTag` |
| `swift` | `swiftPackage`, `clean`, `normalize`, `defaultTag` |
| `typescript` | `plugins` (Hey API plugins), `heyApi` (any other Hey API option), `normalize` |
| `k6` | `scaffold`, `defaultBaseUrl`, `normalize` |
| `docs` | `theme`, `from`; `output` is an HTML file |
| `asyncapi` | `plugins` (`typescript`, `events`, `event-map`, `dispatch`, `amqplib`, `index`; default all) |

Each target can set its own `input`, for example an AsyncAPI file for `asyncapi` next to an OpenAPI file for the rest. Given an AsyncAPI file, the `go`, `kotlin`, `swift`, `java` and `typescript` targets write one model type per message payload and named component schema. A top-level `normalize: true` applies to every target that supports it. Unknown targets and options are errors.

The options are the same ones `ir sdk <target>` takes as flags.

## In CI

`--check` generates into a temporary directory and compares it with what is committed. It lists each file that changed, is missing, or (for targets that clear their output) should no longer be there. Loadtest stubs written by `k6` with `scaffold` belong to you after the first run, so they are never compared.

```yaml
- run: npx ir generate --check
```

## From code

```ts
import { generate, loadIrConfig, watch } from "ir-kit/generate";

const { config, cwd } = await loadIrConfig();
const results = await generate(config, { cwd, check: true });
```
