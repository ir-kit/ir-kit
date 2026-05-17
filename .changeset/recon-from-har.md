---
"@ahmedrowaihi/openapi-recon": minor
---

Add `fromHAR()` + `openapi-recon` CLI — fold HAR files into OpenAPI 3.1 specs without hand-writing the observe-loop.

**Programmatic** (`fromHAR(source, config?)`):

```ts
import { readFile } from "node:fs/promises";
import { fromHAR } from "@ahmedrowaihi/openapi-recon";

const recon = await fromHAR(
  await readFile("./studio-recording.har", "utf8"),
  { title: "Captured API" },
);
const spec = recon.toOpenAPI();
```

**CLI** (`openapi-recon` binary):

```bash
# File → file
openapi-recon ./traffic.har --out spec.json --title "My API"

# File → stdout (pipe to yq for YAML)
openapi-recon ./traffic.har | yq -P > spec.yaml

# stdin
cat traffic.har | openapi-recon -
```

Flags: `--out`, `--title`, `--version`, `--origin`, `--max-examples`, `--no-path-templating`. Status messages go to stderr so stdout/`--out` stays clean for piping. Exit codes: 0 success, 1 internal error, 2 user error.

Both APIs handle edge cases the hand-rolled loop typically missed:

- HTTP/2 pseudo-headers (`:authority`, `:method`, etc.) — silently dropped (Fetch rejects them)
- Empty `postData.text` on `GET`/`HEAD` — silently dropped (Fetch rejects bodies on those)
- Malformed URLs and illegal header values — entry skipped, replay continues

`fromHAR` accepts either pre-parsed `HarFile` objects or raw JSON strings — stays runtime-agnostic (browsers, Workers, Deno). The CLI is Node-only by definition.

Exports the minimal HAR 1.2 shape (`HarFile` / `HarEntry` / `HarRequest` / `HarResponse` / `HarHeader` / `HarSource`) for consumers that want to type their HAR inputs.

This makes HAR the universal capture seam — any tool that exports HAR (k6 Studio Recorder, browser DevTools, mitmproxy, Charles, Postman) feeds straight through `fromHAR()` (or the CLI) into the rest of the contract-kit toolchain.
