---
"@ahmedrowaihi/openapi-recon": minor
---

Add `fromHAR(source, config?)` — fold a HAR 1.2 file or string into a populated `Recon`. Replaces the hand-rolled 20-line observe-loop that every HAR consumer was copying out of the skill docs.

```ts
import { readFile } from "node:fs/promises";
import { fromHAR } from "@ahmedrowaihi/openapi-recon";

const recon = await fromHAR(
  await readFile("./studio-recording.har", "utf8"),
  { title: "Captured API" },
);
const spec = recon.toOpenAPI();
```

Handles the edge cases the manual loop typically missed:

- HTTP/2 pseudo-headers (`:authority`, `:method`, etc.) — silently dropped (Fetch rejects them)
- Empty `postData.text` on `GET`/`HEAD` — silently dropped (Fetch rejects bodies on those)
- Malformed URLs and illegal header values — entry skipped, replay continues

Accepts either pre-parsed `HarFile` objects or raw JSON strings — stays runtime-agnostic (browsers, Workers, Deno). For Node file-reading, pass `await readFile(path, "utf8")` yourself; the package adds no Node-specific imports.

Exports the minimal HAR 1.2 shape (`HarFile` / `HarEntry` / `HarRequest` / `HarResponse` / `HarHeader` / `HarSource`) for consumers that want to type their HAR inputs.

This makes HAR the universal capture seam — any tool that exports HAR (k6 Studio Recorder, browser DevTools, mitmproxy, Charles, Postman) feeds straight through `fromHAR()` into the rest of the contract-kit toolchain.
