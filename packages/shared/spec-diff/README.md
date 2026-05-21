# `@ir-kit/spec-diff`

Cross-family API spec diff. Normalizes both inputs to OpenAPI 3 via `@ir-kit/spec-convert`, then delegates classification to [`api-smart-diff`](https://github.com/udamir/api-smart-diff) — community-standard breaking / non-breaking / annotation / unclassified / deprecated buckets.

Part of [ir-kit](https://github.com/ir-kit/ir-kit).

## Install

```sh
npm install @ir-kit/spec-diff
```

## Usage

```ts
import { diffSpecs } from "@ir-kit/spec-diff";

const result = await diffSpecs({
  before: "./prod.yaml",
  after: "./staging.proto", // mix any two supported formats
});

console.log(result.summary);
// { total: 12, breaking: 3, nonBreaking: 4, annotation: 5, unclassified: 0, deprecated: 0 }

for (const diff of result.diffs.filter((d) => d.type === "breaking")) {
  console.log(diff.action, diff.path.join("/"), diff.description);
}
```

## API

| Export                                                           | Description                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `diffSpecs(opts)`                                                | Run a cross-family diff, return diffs + summary + the two normalized OpenAPI documents |
| `DiffSummary`, `DiffSpecsOptions`, `DiffSpecsResult`, `DiffType` | Public types                                                                           |
| `Diff` (re-export from `api-smart-diff`)                         | Single change record — `{ action, path, type, description?, before?, after? }`         |

## CLI

```sh
ir spec diff ./before.yaml --after ./after.proto
ir spec diff ./prod.yaml --after ./staging.yaml --failOnBreaking --out report.json
```

`--failOnBreaking` exits non-zero when any `breaking` diff is found — drop into CI to gate merges on contract stability.
