# `@ir-kit/asyncapi-core`

Shared AsyncAPI 3.0 primitives for codegen. Mirror of [`@ir-kit/openapi`](https://github.com/ir-kit/ir-kit/tree/main/packages/openapi/ir) for the AsyncAPI track — uniform `parseSpec` entry point on top of `@asyncapi/parser`, plus AMQP binding extractors and routing-key matching.

## Install

```sh
npm install @ir-kit/asyncapi-core
# or pnpm / yarn
```

Peer deps: `@asyncapi/parser`.

## Usage

```ts
import { parseSpec } from "@ir-kit/asyncapi-core";

const { spec, channels, operations, messages } = await parseSpec("./events.yaml");
```

Designed for emitters (`@ir-kit/asyncapi-typescript`) to consume; not typically called from app code.

## Status

`0.1.0` — first release under the `@ir-kit/*` scope. Replaces the legacy `@ahmedrowaihi/asyncapi-core` (deprecated).

## Repo

Source at [ir-kit/ir-kit](https://github.com/ir-kit/ir-kit/tree/main/packages/asyncapi/core).
