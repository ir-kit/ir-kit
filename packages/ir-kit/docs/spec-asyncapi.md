# `ir-kit/spec/asyncapi`

Load and validate an AsyncAPI 3.x document from a file path, URL, string, or pre-parsed `AsyncAPIDocumentInterface`. Wraps `ir-kit/asyncapi`'s `parseSpec` for unified input dispatch.

Part of [ir-kit](https://github.com/ahmedrowaihi/ir-kit). For multi-format input (OpenAPI + AsyncAPI + TypeSpec under one API), reach for [`ir-kit/spec`](../../shared/spec-loader) instead.

## Install

```sh
npm install ir-kit
```

## Usage

```ts
import { loadAsyncAPI } from "ir-kit/spec/asyncapi";

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
