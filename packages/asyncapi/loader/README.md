# `@ir-kit/asyncapi-loader`

Load and validate an AsyncAPI 3.x document from a file path, URL, string, or pre-parsed `AsyncAPIDocumentInterface`. Wraps `@ir-kit/asyncapi-core`'s `parseSpec` for unified input dispatch.

Part of [ir-kit](https://github.com/ir-kit/ir-kit). For multi-format input (OpenAPI + AsyncAPI + TypeSpec under one API), reach for [`@ir-kit/spec-loader`](../../shared/spec-loader) instead.

## Install

```sh
npm install @ir-kit/asyncapi-loader
```

## Usage

```ts
import { loadAsyncAPI } from "@ir-kit/asyncapi-loader";

const doc = await loadAsyncAPI({
  input: "./events.yaml", // path, URL, or pre-parsed AsyncAPIDocumentInterface
});

doc.channels().all();
```

If the input is already an `AsyncAPIDocumentInterface`, it passes through unchanged. String inputs are resolved relative to `opts.cwd` (defaulting to `process.cwd()`).

## API

| Export                                 | Description                                                       |
| -------------------------------------- | ----------------------------------------------------------------- |
| `loadAsyncAPI(opts)`                   | Resolve + parse + validate, return an `AsyncAPIDocumentInterface` |
| `AsyncAPIInput`, `LoadAsyncAPIOptions` | Public types                                                      |
