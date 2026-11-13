# `@ir-kit/kit/asyncapi`

Shared AsyncAPI 3.0 primitives for codegen. Mirror of [`@ir-kit/kit/openapi`](https://github.com/ahmedrowaihi/ir-kit/tree/main/packages/ir-kit/docs/openapi.md) for the AsyncAPI track — uniform `parseSpec` entry point on top of `@asyncapi/parser`, plus AMQP binding extractors and routing-key matching.

## Install

```sh
npm install @ir-kit/kit
# or pnpm / yarn
```

Peer deps: `@asyncapi/parser`.

## Usage

```ts
import { parseSpec } from "@ir-kit/kit/asyncapi";

const { spec, channels, operations, messages } = await parseSpec("./events.yaml");
```

Designed for emitters (`@ir-kit/kit/sdk/asyncapi`) to consume; not typically called from app code.

## Status

`0.1.0` — first release under the `@ir-kit/*` scope. Replaces the legacy `@ahmedrowaihi/asyncapi-core` (deprecated).

## Repo

Source at [ahmedrowaihi/ir-kit](https://github.com/ahmedrowaihi/ir-kit/tree/main/packages/ir-kit/docs/asyncapi.md).
