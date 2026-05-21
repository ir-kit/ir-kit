# `@ir-kit/spec-docs`

Render any supported API spec as a standalone HTML documentation page via [Scalar API Reference](https://github.com/scalar/scalar). Converts the input to OpenAPI 3 first (using `@ir-kit/spec-convert`), then delegates HTML emission to `@scalar/core`'s `getHtmlDocument` — the same renderer the official Express / Hono / Fastify integrations use.

Part of [ir-kit](https://github.com/ir-kit/ir-kit).

## Install

```sh
npm install @ir-kit/spec-docs
```

## Usage

```ts
import { writeFile } from "node:fs/promises";
import { renderDocs } from "@ir-kit/spec-docs";

const { html } = await renderDocs({
  input: "./api.yaml", // postman / proto / typespec / openapi3 / asyncapi3
  theme: "moon", // optional Scalar theme
});

await writeFile("docs.html", html);
```

The output is a self-contained HTML page that loads Scalar from CDN — no bundler required, ready to drop on any static host.

## API

| Export                                               | Description                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `renderDocs(opts)`                                   | Convert spec to OpenAPI 3 if needed, return `{ html, openapi, from }` |
| `RenderDocsOptions`, `RenderDocsResult`, `DocsTheme` | Public types                                                          |

Any input format supported by [`@ir-kit/spec-convert`](../spec-convert) works (currently: openapi3, postman, proto, typespec, asyncapi3, json-schema).

## CLI

```sh
ir docs ./api.yaml --out docs.html
ir docs ./collection.postman_collection.json --theme moon --out docs.html
```
