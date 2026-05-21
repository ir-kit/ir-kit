# `@ir-kit/create-k6`

Wizard scaffolder for the [`@ir-kit/k6`](https://github.com/ir-kit/ir-kit/tree/main/packages/k6/framework) stack. Run `npm create @ir-kit/k6` (or the pnpm / yarn equivalent) to generate a typed client from your OpenAPI spec and a starter `loadtest.ts` in one shot.

## Use

```sh
npm create @ir-kit/k6@latest
# pnpm create @ir-kit/k6
# yarn create @ir-kit/k6
```

The wizard asks for:

- OpenAPI spec source (path or URL)
- Output directory
- Whether to scaffold a per-tag scenario folder

It writes:

- `src/gen/` — typed k6 client + types + faker data builders
- `loadtests/` (optional) — one starter file per OpenAPI tag
- `package.json` with the right `@ir-kit/k6` + `@ir-kit/k6-toolkit` deps

## What you get

```ts
// loadtests/smoke.ts
import { defineLoadTest, flow, smoke, useAuth } from "@ir-kit/k6";
import { client } from "../src/gen";

export const options = smoke();

export default defineLoadTest({
  setup: () => useAuth({ bearer: "token" }),
  scenarios: flow().step("list pets", () => client.listPets()),
});
```

## Status

`0.1.0` — first release under the `@ir-kit/*` scope. Replaces the legacy `@ahmedrowaihi/create-k6` (deprecated).

## Repo

Source at [ir-kit/ir-kit](https://github.com/ir-kit/ir-kit/tree/main/packages/k6/create).
