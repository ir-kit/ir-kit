# ir-kit/openapi-tools

OpenAPI helpers for matching requests to routes, merging specs and reading enum and union schemas.

Part of [ir-kit](https://github.com/ahmedrowaihi/ir-kit).

## Install

```bash
pnpm add ir-kit
```

## Usage

To parse a spec, use `parseOpenAPI` from [`ir-kit/ir`](./ir.md). To compare two specs, use `ir spec diff` or `diffSpecs` from [`ir-kit/spec`](./spec-diff.md).

## Origin

Previously shipped as `ir-kit/openapi-ts/orpc/tools` subpath. Extracted into its own package since the utilities are spec-host-agnostic — they don't depend on oRPC.
