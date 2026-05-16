---
name: openapi-from-traffic
description: Reverse-engineer an OpenAPI 3.1 spec from observed HTTP traffic. Use `@ahmedrowaihi/openapi-recon` (a runtime-agnostic lib that accepts standard Web Fetch `Request` / `Response` pairs and folds them into a JSON Schema 2020-12 document) when the user has live traffic but no spec, wants to discover a third-party API's shape, capture an internal API from real usage, or generate a starting `openapi.yaml` from a HAR/proxy log. For interactive capture from a browser, point them at `@ahmedrowaihi/glean` (the Chrome DevTools extension built on `openapi-recon`). Triggers on "reverse engineer API", "discover spec from traffic", "OpenAPI from HAR", "capture API in DevTools", "infer schema from requests", "spec from observed HTTP", "generate spec from network tab". Do NOT use when the user already has an OpenAPI spec — see openapi-sdk or k6-loadtest instead.
---

# OpenAPI from observed HTTP — `@ahmedrowaihi/openapi-recon`

Programmatic spec inference from real traffic. Feed standard Web Fetch `Request` / `Response` pairs, get back an `OpenAPIV3_1.Document` with templated paths, JSON Schema 2020-12 bodies, per-status response schemas, and detected auth schemes.

Runtime-agnostic: works in browsers, Node, Deno, Bun, Cloudflare Workers — anywhere `Request` / `Response` exist. Pure functions, no global state, tree-shakable.

## When to reach for this

- User wants to document an existing API but has no `openapi.yaml`.
- User has a HAR file, a proxy log, or service-worker observations they want to convert to a spec.
- User is integrating with a third-party API and needs to capture its shape from real calls.
- User wants live spec generation from a service mesh / observability pipeline.

For interactive browser-tab capture, suggest the **Chrome DevTools extension** `@ahmedrowaihi/glean` instead of writing the lib glue yourself — it ships with the UI for picking origins, filtering noise, and exporting YAML/JSON.

## Library use (Node / browser / Workers)

```ts
import { createRecon } from "@ahmedrowaihi/openapi-recon";

const recon = createRecon({
  title: "Petstore",
  version: "0.1.0",
  maxExamples: 3,                      // examples kept per shape (default 3)
  refDedupeThreshold: 2,               // when to extract repeated schemas as $ref (default 2)
  redactHeaders: ["x-secret-header"],  // header names to scrub from examples
});

// Anywhere you observe traffic — fetch wrapper, service-worker, proxy hook:
await recon.observe(request, response);

// Snapshot whenever:
const document = recon.toOpenAPI();   // → OpenAPIV3_1.Document

// Per-origin snapshot (when feeding traffic from multiple backends):
const justBackend = recon.toOpenAPI({ origin: "https://api.example.com" });
```

### Input requirements

- `request` / `response` are **standard Web Fetch** types — same as `fetch()` accepts/returns.
- **Bodies must already be readable.** Call `.clone()` upstream if you also need to forward the response — `recon.observe` consumes the body.
- **Non-JSON bodies are skipped silently.** Form data, binary, multipart — currently ignored.

## What it infers

| Layer | Behavior |
|---|---|
| **Path templating** | `/pets/42` + `/pets/8` collapse into `/pets/{petId}` with `{ petId: "string" }`. Pure-numeric segments become `integer`. Disable with `pathTemplating: false`. |
| **Request / response bodies** | JSON Schema 2020-12, merged across samples (union types, optional fields, enum candidates). |
| **Per-status responses** | `200` and `404` keep distinct shapes — not collapsed into one. |
| **Auth schemes** | `Authorization: Bearer …` → `bearerAuth`; `X-API-Key: …` → `apiKeyAuth`; HTTP Basic too. Detected per-operation, deduped at `components.securitySchemes`. |
| **Per-origin grouping** | Feed traffic from many backends, snapshot one origin at a time via `toOpenAPI({ origin })`. |

## Common integration patterns

### Fetch wrapper (intercept at the call site)

```ts
import { createRecon } from "@ahmedrowaihi/openapi-recon";

const recon = createRecon({ title: "MyAPI" });

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const req = new Request(input, init);
  const res = await originalFetch(req.clone());
  // Clone so the caller still gets a readable body
  await recon.observe(req, res.clone());
  return res;
};
```

### Cloudflare Worker / edge proxy

```ts
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const res = await fetch(req.clone());
    await env.RECON_DO.observe(req, res.clone());  // store via Durable Object
    return res;
  },
};
```

### HAR file replay (offline analysis)

```ts
import { readFile } from "node:fs/promises";

const har = JSON.parse(await readFile("./traffic.har", "utf8"));
const recon = createRecon({ title: "Captured" });

for (const entry of har.log.entries) {
  const req = new Request(entry.request.url, {
    method: entry.request.method,
    headers: Object.fromEntries(entry.request.headers.map((h) => [h.name, h.value])),
    body: entry.request.postData?.text,
  });
  const res = new Response(entry.response.content.text, {
    status: entry.response.status,
    headers: Object.fromEntries(entry.response.headers.map((h) => [h.name, h.value])),
  });
  await recon.observe(req, res);
}

const document = recon.toOpenAPI();
```

## Glean — the Chrome extension

For ad-hoc capture from a browser, install [`@ahmedrowaihi/glean`](https://github.com/ahmedrowaihi/contract-kit/tree/main/apps/glean) (or the Chrome Web Store listing once shipped). It adds a DevTools panel that:

1. Captures network traffic from the inspected page.
2. Folds it through `openapi-recon` in real time.
3. Lets the user pick an origin, redact headers, and export YAML/JSON.

No code required — useful when the workflow is "browse the app, dump a spec at the end".

## Common pitfalls

- **Bodies are consumed.** If your hook also forwards the response, clone first: `recon.observe(req, res.clone())`.
- **JSON only.** Form-encoded / multipart / binary bodies don't fold into the spec yet. Skip the request rather than failing.
- **Auth detection is heuristic** — based on header presence + format. If the API uses a non-standard auth scheme, post-process `components.securitySchemes` manually.
- **Numeric path segments** like `/items/v2/foo` won't break path templating — the `v2` stays literal because it's not pure-numeric.
- **Sample count matters.** With `maxExamples: 1`, optional fields look required. Feed more traffic for accurate optionality.

## Workflow: capture → spec → SDK

Recon emits a spec; pair with one of the SDK generators to round-trip:

```ts
import { createRecon } from "@ahmedrowaihi/openapi-recon";
import { generate } from "@ahmedrowaihi/openapi-typescript";

// ... feed traffic, then:
const spec = recon.toOpenAPI();

await generate({
  input: spec,            // pre-parsed object — no fetch/parse step
  output: "./client",
});
```

This is the entire "spec discovery → typed client" pipeline for unknown APIs.

## How AI agents should use this

1. If the user wants to capture interactively from a browser → suggest the **Glean extension** first.
2. If the user wants programmatic capture (Node script, Worker, proxy) → show `createRecon` + the `observe(req, res)` loop.
3. If the user has a HAR file → show the HAR-replay pattern.
4. If they want to pipe the output to an SDK generator → show the recon → `openapi-typescript` (or any `openapi-{lang}`) handoff.
5. Remind them to `.clone()` request/response when also forwarding.
